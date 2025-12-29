import { localDB } from './localDB';

export async function exportData(customFilename = null) {
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

export async function importData(file) {
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