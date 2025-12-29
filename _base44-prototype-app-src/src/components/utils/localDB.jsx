
/* Local, offline-first data store using localStorage.
   Exposes simple CRUD for CatTrucker, Project, and TimeEntry.
   API:
     localDB.CatTrucker|Project|TimeEntry.list()
     .get(id)
     .create(obj)
     .bulkCreate(list)
     .update(id, updates)
     .delete(id)
     .clear()
*/

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

function createApi(storeName) {
  return {
    async list() {
      const db = loadDB();
      const store = getStore(db, storeName);
      // Return a new array copy to avoid accidental mutations
      return [...store.items];
    },
    async get(id) {
      const db = loadDB();
      const store = getStore(db, storeName);
      return store.items.find((it) => it.id === id) || null;
    },
    async create(obj) {
      const db = loadDB();
      const store = getStore(db, storeName);
      const id = store.seq++;
      const created = { ...obj, id };
      store.items.push(created);
      saveDB(db);
      return created;
    },
    async bulkCreate(list) {
      const db = loadDB();
      const store = getStore(db, storeName);
      const created = list.map((obj) => {
        const id = store.seq++;
        return { ...obj, id };
      });
      store.items.push(...created);
      saveDB(db);
      return created;
    },
    async update(id, updates) {
      const db = loadDB();
      const store = getStore(db, storeName);
      const idx = store.items.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error(`${storeName} item with id ${id} not found`);
      const updated = { ...store.items[idx], ...updates, id };
      store.items[idx] = updated;
      saveDB(db);
      return updated;
    },
    async delete(id) {
      const db = loadDB();
      const store = getStore(db, storeName);
      const idx = store.items.findIndex((it) => it.id === id);
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

export const localDB = {
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
