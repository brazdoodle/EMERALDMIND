// Lightweight local entity shims to replace Base44 entities for local development.
// These use localStorage as a simple persistence layer so the app can function
// without the Base44 backend. Each entity provides list/create/update/delete.

// Determine storage key per entity and per active user.
const getActiveUserId = () => {
	try {
		const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('emeraldmind-user-data') : null;
		if (!stored) return 'default-user';
		const parsed = JSON.parse(stored);
		return parsed?.currentUser?.id || 'default-user';
	} catch (_e) {
		return 'default-user';
	}
};

const storageKey = (name) => `local_entity_${name}_user_${getActiveUserId()}`;

// In environments where `localStorage` is not available (Node test harnesses),
// provide a simple in-memory fallback so entity APIs don't throw.
const __inMemoryEntityStore = globalThis.__inMemoryEntityStore || (globalThis.__inMemoryEntityStore = {});

const readStore = (name) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.getItem) {
			const raw = localStorage.getItem(storageKey(name));
			return raw ? JSON.parse(raw) : [];
		}
	} catch (_) {
		// fall through to in-memory
	}
	return __inMemoryEntityStore[name] ? __inMemoryEntityStore[name].slice() : [];
};

const writeStore = (name, arr) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.setItem) {
			localStorage.setItem(storageKey(name), JSON.stringify(arr));
			return;
		}
	} catch (_) {
		// fall through to in-memory
	}
	__inMemoryEntityStore[name] = arr.slice();
};

// Baseline storage functions for immutable system-wide entries
const baselineStorageKey = (name) => `baseline_entity_${name}`;

const readBaselineStore = (name) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.getItem) {
			const raw = localStorage.getItem(baselineStorageKey(name));
			return raw ? JSON.parse(raw) : [];
		}
	} catch (_) {
		// fall through to in-memory
	}
	const baselineKey = `baseline_${name}`;
	return __inMemoryEntityStore[baselineKey] ? __inMemoryEntityStore[baselineKey].slice() : [];
};

const writeBaselineStore = (name, arr) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.setItem) {
			localStorage.setItem(baselineStorageKey(name), JSON.stringify(arr));
			return;
		}
	} catch (_) {
		// fall through to in-memory
	}
	const baselineKey = `baseline_${name}`;
	__inMemoryEntityStore[baselineKey] = arr.slice();
};

// Hidden entries storage (user-specific list of hidden baseline entry IDs)
const hiddenStorageKey = (name) => `hidden_${name}_user_${getActiveUserId()}`;

const readHiddenStore = (name) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.getItem) {
			const raw = localStorage.getItem(hiddenStorageKey(name));
			return raw ? JSON.parse(raw) : [];
		}
	} catch (_) {
		// fall through to in-memory
	}
	const hiddenKey = `hidden_${name}_${getActiveUserId()}`;
	return __inMemoryEntityStore[hiddenKey] ? __inMemoryEntityStore[hiddenKey].slice() : [];
};

const writeHiddenStore = (name, arr) => {
	try {
		if (typeof localStorage !== 'undefined' && localStorage.setItem) {
			localStorage.setItem(hiddenStorageKey(name), JSON.stringify(arr));
			return;
		}
	} catch (_) {
		// fall through to in-memory
	}
	const hiddenKey = `hidden_${name}_${getActiveUserId()}`;
	__inMemoryEntityStore[hiddenKey] = arr.slice();
};

const makeEntity = (name) => ({
	list: async (order) => {
		try {
			const userItems = readStore(name);
			
			// For KnowledgeEntry, also include baseline entries (filtered for hidden ones)
			if (name === 'KnowledgeEntry') {
				const baselineItems = readBaselineStore('KnowledgeEntry');
				const hiddenIds = readHiddenStore('KnowledgeEntry');
				
				// Filter out hidden baseline entries for this user
				const visibleBaselineItems = baselineItems
					.filter(item => !hiddenIds.includes(item.id))
					.map(item => ({ ...item, isBaseline: true }));
				
				return [...userItems, ...visibleBaselineItems];
			}
			return userItems;
		} catch (_e) {
			console.warn('Failed to read entity store for', name, e?.message);
			return [];
		}
	},

	// Return items matching a simple criteria object (shallow equality)
	filter: async (criteria = {}) => {
		const items = await makeEntity(name).list();
		return items.filter(item => {
			for (const [k, v] of Object.entries(criteria || {})) {
				if (item[k] !== v) return false;
			}
			return true;
		});
	},

	// Bulk create multiple items - for bulk uploads, always create as baseline entries
	bulkCreate: async (arr = []) => {
		if (!Array.isArray(arr) || arr.length === 0) return [];
		
		const created = [];

		for (const obj of arr) {
			const id = Math.random().toString(36).slice(2, 9);
			const item = { 
				...obj, 
				id, 
				created_date: new Date().toISOString(),
				isBaseline: true // Mark as baseline entry
			};
			created.push(item);
		}

		// All bulk created entries go to baseline storage (immutable)
		if (name === 'KnowledgeEntry') {
			const baselineItems = readBaselineStore('KnowledgeEntry');
			created.forEach(item => baselineItems.unshift(item));
			writeBaselineStore('KnowledgeEntry', baselineItems);
		}

		return created;
	},

	create: async (obj) => {
		const id = Math.random().toString(36).slice(2, 9);
		const item = { 
			...obj, 
			id, 
			created_date: new Date().toISOString(),
			isBaseline: false // User-created entries are not baseline
		};

		// All single creates go to user storage (deletable)
		const items = readStore(name);
		items.unshift(item);
		writeStore(name, items);

		return item;
	},

	update: async (id, data) => {
		// Only allow updates to user entries, not baseline entries
		const userItems = readStore(name);
		const userIdx = userItems.findIndex(i => i.id === id);
		
		if (userIdx !== -1) {
			userItems[userIdx] = { ...userItems[userIdx], ...data };
			writeStore(name, userItems);
			return userItems[userIdx];
		}

		throw new Error(`${name} not found or is read-only baseline entry`);
	},

	delete: async (id) => {
		// Only allow deletion of user entries
		const userItems = readStore(name);
		const userFiltered = userItems.filter(i => i.id !== id);
		
		if (userFiltered.length !== userItems.length) {
			writeStore(name, userFiltered);
			return true;
		}

		throw new Error(`${name} not found or is read-only baseline entry`);
	},

	// New method to hide/unhide baseline entries for current user
	hideBaseline: async (id) => {
		if (name === 'KnowledgeEntry') {
			const hiddenIds = readHiddenStore('KnowledgeEntry');
			if (!hiddenIds.includes(id)) {
				hiddenIds.push(id);
				writeHiddenStore('KnowledgeEntry', hiddenIds);
			}
		}
	},

	unhideBaseline: async (id) => {
		if (name === 'KnowledgeEntry') {
			const hiddenIds = readHiddenStore('KnowledgeEntry');
			const filtered = hiddenIds.filter(hiddenId => hiddenId !== id);
			writeHiddenStore('KnowledgeEntry', filtered);
		}
	}
});

export const ROMProject = makeEntity('ROMProject');
export const Flag = makeEntity('Flag');
export const Trainer = makeEntity('Trainer');
export const Script = makeEntity('Script');
export const Sprite = makeEntity('Sprite');
export const StoryEvent = makeEntity('StoryEvent');
export const NPCProfile = makeEntity('NPCProfile');
export const EmulatorSession = makeEntity('EmulatorSession');
export const KnowledgeEntry = makeEntity('KnowledgeEntry');
export const ChangelogEntry = makeEntity('ChangelogEntry');

// Simple auth stub using localStorage
export const User = {
	get: () => ({ id: 'local-user', name: 'Local User' }),
	current: () => User.get()
};