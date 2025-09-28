/**
 * Project File System Utility
 * Manages project directory structure and data persistence with user organization
 */

// Project directory structure
export const PROJECT_STRUCTURE = {
  scripts: 'scripts',
  trainers: 'trainers', 
  sprites: 'sprites',
  npcs: 'npcs',
  story: 'story',
  flags: 'flags',
  changelog: 'changelog',
  metadata: 'metadata'
};

// File extensions for different data types
export const FILE_EXTENSIONS = {
  script: '.hma',
  trainer: '.json',
  sprite: '.png',
  npc: '.json',
  story: '.json',
  flag: '.json',
  changelog: '.json',
  metadata: '.json'
};

/**
 * Creates initial project data structure with sample files
 */
export function initializeProjectData(userId, projectId, projectName = 'New Project') {
  const timestamp = new Date().toISOString();
  
  // Initialize with basic project metadata
  saveProjectData(userId, projectId, 'metadata', 'project_info', {
    name: projectName,
    description: `ROM hack project: ${projectName}`,
    created: timestamp,
    lastModified: timestamp,
    version: '1.0.0'
  });
  
  // Create empty collections for other data types
  const dataTypes = ['flags', 'trainers', 'scripts', 'sprites', 'npcs', 'story', 'changelog'];
  dataTypes.forEach(dataType => {
    saveProjectData(userId, projectId, dataType, '_collection', {
      items: [],
      count: 0,
      lastModified: timestamp
    });
  });
  
  console.log(`Initialized project data for user ${userId}, project ${projectId}`);
  return { userId, projectId, initialized: true };
}

/**
 * Creates the project directory structure with user organization
 */
export function createProjectDirectories(userId, projectId) {
  const projectPath = `users/${userId}/projects/${projectId}`;
  const directories = Object.values(PROJECT_STRUCTURE).map(dir => `${projectPath}/${dir}`);
  
  // In a real file system, these would be actual directories
  // For now, we'll simulate this with a project metadata structure
  return {
    userId,
    projectId,
    projectPath,
    directories,
    structure: Object.fromEntries(
      Object.entries(PROJECT_STRUCTURE).map(([key, dir]) => [key, `${projectPath}/${dir}`])
    )
  };
}

/**
 * Saves project data to the appropriate directory
 */
export function saveProjectData(userId, projectId, dataType, fileName, data) {
  const projectStructure = createProjectDirectories(userId, projectId);
  const filePath = `${projectStructure.structure[dataType]}/${fileName}${FILE_EXTENSIONS[dataType]}`;
  
  // Simulate file save - in real implementation, this would write to filesystem
  const saveData = {
    filePath,
    timestamp: new Date().toISOString(),
    data,
    metadata: {
      userId,
      projectId,
      dataType,
      fileName,
      version: '1.0.0'
    }
  };
  
  console.log(`Saving ${dataType} data to: ${filePath}`, saveData);
  
  // Store in localStorage for persistence simulation
  const storageKey = `user_${userId}_project_${projectId}_${dataType}_${fileName}`;
  localStorage.setItem(storageKey, JSON.stringify(saveData));
  
  return saveData;
}

/**
 * Loads project data from the appropriate directory
 */
export function loadProjectData(userId, projectId, dataType, fileName) {
  const storageKey = `user_${userId}_project_${projectId}_${dataType}_${fileName}`;
  const savedData = localStorage.getItem(storageKey);
  
  if (savedData) {
    return JSON.parse(savedData);
  }
  
  return null;
}

/**
 * Lists all files in a project directory by data type
 */
export function listProjectFiles(userId, projectId, dataType) {
  const files = [];
  const prefix = `user_${userId}_project_${projectId}_${dataType}_`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          files.push({
            fileName: parsedData.metadata.fileName,
            timestamp: parsedData.timestamp,
            dataType: parsedData.metadata.dataType
          });
        } catch (_e) {
          console.warn(`Failed to parse stored data for key: ${key}`);
        }
      }
    }
  }
  
  return files.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Gets all projects for a specific user
 */
export function getUserProjects(userId) {
  const projects = new Set();
  const prefix = `user_${userId}_project_`;
  const metaSuffix = `_metadata_project_info`;
  const knownDirs = Object.values(PROJECT_STRUCTURE).join('|');

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;

    // Fast path: if we find the metadata manifest key, extract projectId between prefix and suffix
    if (key.includes(metaSuffix)) {
      const start = prefix.length;
      const end = key.indexOf(metaSuffix);
      if (end > start) {
        const projectId = key.slice(start, end);
        projects.add(projectId);
        continue;
      }
    }

    // Fallback: try to match a pattern like user_{userId}_project_{projectId}_{dataType}_
    const regex = new RegExp(`^${prefix}(.+?)_(${knownDirs}|metadata|scripts|flags|trainers|sprites|npcs|story|changelog)_`);
    const match = key.match(regex);
    if (match && match[1]) {
      projects.add(match[1]);
    }
  }

  return Array.from(projects);
}

/**
 * Loads complete project structure for a user
 */
export function loadCompleteProject(userId, projectId) {
  const project = {
    userId,
    projectId,
    structure: {}
  };
  
  Object.keys(PROJECT_STRUCTURE).forEach(dataType => {
    const files = listProjectFiles(userId, projectId, dataType);
    project.structure[dataType] = files.map(file => {
      const fullData = loadProjectData(userId, projectId, dataType, file.fileName);
      return {
        fileName: file.fileName,
        timestamp: file.timestamp,
        data: fullData ? fullData.data : null
      };
    });
  });
  
  return project;
}

/**
 * Exports entire project as a downloadable archive
 */
export function exportProject(userId, projectId) {
  const projectData = loadCompleteProject(userId, projectId);
  
  const exportData = {
    userId,
    projectId,
    exportDate: new Date().toISOString(),
    structure: projectData,
    version: '1.0.0'
  };
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectId}_export_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return exportData;
}

/**
 * Imports project from uploaded file
 */
export function importProject(file, targetUserId = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target.result);

        // Validate project structure
        if (!projectData.projectId || !projectData.structure) {
          throw new Error('Invalid project file format');
        }

        // Import all project data
        Object.entries(projectData.structure).forEach(([dataType, files]) => {
          files.forEach(file => {
            if (file.data) {
              // Import with provided targetUserId, original userId, or fallback to 'default-user'
              const destUserId = targetUserId || projectData.userId || 'default-user';
              saveProjectData(destUserId, projectData.projectId, dataType, file.fileName, file.data);
            }
          });
        });

        resolve(projectData);
      } catch (_error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Deletes all project data for a specific user
 */
export function deleteProject(userId, projectId) {
  const keysToDelete = [];
  const prefix = `user_${userId}_project_${projectId}_`;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => localStorage.removeItem(key));
  
  return { deleted: keysToDelete.length };
}

/**
 * Gets project summary statistics
 */
export function getProjectSummary(userId, projectId) {
  const summary = {};
  
  Object.keys(PROJECT_STRUCTURE).forEach(dataType => {
    const files = listProjectFiles(userId, projectId, dataType);
    summary[dataType] = {
      count: files.length,
      files: files.map(f => ({ name: f.fileName, lastModified: f.lastModified }))
    };
  });
  
  return summary;
}