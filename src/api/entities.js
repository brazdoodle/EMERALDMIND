// Lightweight local entity shims to replace Base44 entities for local development.
// These use localStorage as a simple persistence layer so the app can function
// without the Base44 backend. Each entity provides list/create/update/delete.

const storageKey = (name) => `local_entity_${name}`;

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

const makeEntity = (name) => ({
	list: async (order) => {
		try {
			return readStore(name);
		} catch (e) {
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

	// Bulk create multiple items (used for seeding vanilla flags)
	bulkCreate: async (arr = []) => {
		if (!Array.isArray(arr) || arr.length === 0) return [];
		const items = await makeEntity(name).list();
		const created = [];
		for (const obj of arr) {
			const id = Math.random().toString(36).slice(2, 9);
			const item = { ...obj, id, created_date: new Date().toISOString() };
			items.unshift(item);
			created.push(item);
		}
		writeStore(name, items);
		return created;
	},
	create: async (obj) => {
			const items = await makeEntity(name).list();
			const id = Math.random().toString(36).slice(2, 9);
			const item = { ...obj, id, created_date: new Date().toISOString() };
			items.unshift(item);
			writeStore(name, items);
			return item;
	},
	update: async (id, data) => {
			const items = await makeEntity(name).list();
			const idx = items.findIndex(i => i.id === id);
			if (idx === -1) throw new Error(`${name} not found`);
			items[idx] = { ...items[idx], ...data };
			writeStore(name, items);
			return items[idx];
	},
	delete: async (id) => {
			const items = await makeEntity(name).list();
			const filtered = items.filter(i => i.id !== id);
			writeStore(name, filtered);
			return true;
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