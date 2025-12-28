// ========================================
// LOCAL DATABASE - localStorage wrapper
// ========================================

const STORAGE_KEY = 'pringles_local_db_v1';

function loadDB() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to parse DB from storage, resetting.', e);
    }
    // Initialize empty DB
    const initial = {
        CatTrucker: { seq: 1, items: [] },
        Project: { seq: 1, items: [] },
        TimeEntry: { seq: 1, items: [] },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
}

function saveDB(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function getStore(db, storeName) {
    if (!db[storeName]) {
        db[storeName] = { seq: 1, items: [] };
    }
    return db[storeName];
}

// Map store names to their ID field names
const idFieldMap = {
    CatTrucker: 'cat_trucker_id',
    Project: 'project_id',
    TimeEntry: 'time_entry_id'
};

function createApi(storeName) {
    const idField = idFieldMap[storeName] || 'id';
    
    return {
        async list() {
            const db = loadDB();
            const store = getStore(db, storeName);
            return [...store.items];
        },
        async get(id) {
            const db = loadDB();
            const store = getStore(db, storeName);
            return store.items.find((it) => it[idField] === id) || null;
        },
        async create(obj) {
            const db = loadDB();
            const store = getStore(db, storeName);
            // Generate unique ID if not provided
            const uniqueId = obj[idField] || `${storeName.toLowerCase()}_${Date.now()}_${store.seq++}`;
            const created = { ...obj, [idField]: uniqueId };
            store.items.push(created);
            saveDB(db);
            return created;
        },
        async bulkCreate(list) {
            const db = loadDB();
            const store = getStore(db, storeName);
            const created = list.map((obj) => {
                const uniqueId = obj[idField] || `${storeName.toLowerCase()}_${Date.now()}_${store.seq++}`;
                return { ...obj, [idField]: uniqueId };
            });
            store.items.push(...created);
            saveDB(db);
            return created;
        },
        async update(id, updates) {
            const db = loadDB();
            const store = getStore(db, storeName);
            const idx = store.items.findIndex((it) => it[idField] === id);
            if (idx === -1) throw new Error(`${storeName} item with id ${id} not found`);
            const updated = { ...store.items[idx], ...updates, [idField]: id };
            store.items[idx] = updated;
            saveDB(db);
            return updated;
        },
        async delete(id) {
            const db = loadDB();
            const store = getStore(db, storeName);
            const idx = store.items.findIndex((it) => it[idField] === id);
            if (idx === -1) return false;
            store.items.splice(idx, 1);
            saveDB(db);
            return true;
        },
        async clear() {
            const db = loadDB();
            db[storeName] = { seq: 1, items: [] };
            saveDB(db);
            return true;
        },
    };
}

const localDB = {
    CatTrucker: createApi('CatTrucker'),
    Project: createApi('Project'),
    TimeEntry: createApi('TimeEntry'),
    async clearAllData() {
        const initial = {
            CatTrucker: { seq: 1, items: [] },
            Project: { seq: 1, items: [] },
            TimeEntry: { seq: 1, items: [] },
        };
        saveDB(initial);
        return true;
    },
};

// ========================================
// CAT SESSION - Selected cat management
// ========================================

const CAT_SESSION_KEY = 'pringles-selected-cat';

function getSelectedCatId() {
    try {
        const stored = localStorage.getItem(CAT_SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error reading selected cat from localStorage:', error);
        return null;
    }
}

function setSelectedCatId(catId) {
    try {
        if (catId) {
            localStorage.setItem(CAT_SESSION_KEY, JSON.stringify(catId));
        } else {
            localStorage.removeItem(CAT_SESSION_KEY);
        }
        window.dispatchEvent(new CustomEvent('cat-session-changed', { detail: catId }));
    } catch (error) {
        console.error('Error saving selected cat to localStorage:', error);
    }
}

function clearSelectedCat() {
    setSelectedCatId(null);
}

// CatSession object for app.js compatibility
const CatSession = {
    getCurrentSession() {
        const catId = getSelectedCatId();
        if (!catId) return null;
        return { cat_trucker_id: catId };
    },
    setSession(catId, nickname) {
        setSelectedCatId(catId);
    },
    clearSession() {
        clearSelectedCat();
    }
};

// ========================================
// DATA MANAGER - Import/Export
// ========================================

async function exportData(customFilename = null) {
    try {
        const [catTruckers, projects, timeEntries] = await Promise.all([
            localDB.CatTrucker.list(),
            localDB.Project.list(),
            localDB.TimeEntry.list(),
        ]);

        const dataToExport = {
            catTruckers,
            projects,
            timeEntries,
            exportDate: new Date().toISOString(),
            version: '1.0.0',
        };

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = customFilename || `pringles-time-trucking-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        console.error("Error exporting data:", error);
        return { success: false, error };
    }
}

async function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.catTruckers || !data.projects || !data.timeEntries) {
                    throw new Error('Invalid backup file format.');
                }

                await localDB.clearAllData();
                
                if(data.catTruckers.length > 0) await localDB.CatTrucker.bulkCreate(data.catTruckers);
                if(data.projects.length > 0) await localDB.Project.bulkCreate(data.projects);
                if(data.timeEntries.length > 0) await localDB.TimeEntry.bulkCreate(data.timeEntries);
                
                window.dispatchEvent(new CustomEvent('cat-session-changed'));

                resolve({ success: true });
            } catch (error) {
                console.error('Error processing import file:', error);
                reject({ success: false, error });
            }
        };

        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            reject({ success: false, error });
        };

        reader.readAsText(file);
    });
}

// Make available globally
window.localDB = localDB;
window.CatTrucker = localDB.CatTrucker;
window.Project = localDB.Project;
window.TimeEntry = localDB.TimeEntry;
window.CatSession = CatSession;
window.getSelectedCatId = getSelectedCatId;
window.setSelectedCatId = setSelectedCatId;
window.clearSelectedCat = clearSelectedCat;
window.exportData = exportData;
window.importData = importData;
