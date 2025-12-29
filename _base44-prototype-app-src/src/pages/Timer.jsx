import React, { useState, useEffect, useRef, useCallback } from "react";
import { localDB } from "@/components/utils/localDB";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { getText } from "../components/utils/translations";
import { getSelectedCatId } from "../components/utils/catSession";

import ProjectSelector from "../components/timer/ProjectSelector";
import TimerControls from "../components/timer/TimerControls";
import RecentEntries from "../components/timer/RecentEntries";
import EditTimeEntryDialog from "../components/timer/EditTimeEntryDialog";

export default function Timer() {
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  const timerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleLanguageChange = () => {
      // Force re-render to update texts
      setCurrentCat(currentCat ? {...currentCat} : null);
    };
    window.addEventListener("language-changed", handleLanguageChange);
    return () => window.removeEventListener("language-changed", handleLanguageChange);
  }, [currentCat]);

  const setProjectFromId = useCallback(async (projectId) => {
    try {
      const foundProject = projects.find(p => p.project_id === projectId);
      if (foundProject) {
        setSelectedProject(foundProject);
        return;
      }
      const allProjects = await localDB.Project.list();
      const project = allProjects.find(p => p.project_id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    } catch (error) {
      console.error("Error setting project from ID:", error);
    }
  }, [projects]);

  const debouncedLoadData = useCallback(async (cat) => {
    const now = Date.now();
    if (now - lastFetchTime < 500) return;
    setLastFetchTime(now);

    if (!cat || !cat.cat_trucker_id) {
      setProjects([]);
      setTimeEntries([]);
      return;
    }

    try {
      const allProjects = await localDB.Project.list();
      const catProjects = allProjects.filter(p => p.cat_trucker_id === cat.cat_trucker_id);
      
      const uniqueProjects = catProjects.filter((p, index, self) => 
        index === self.findIndex((t) => t.project_id === p.project_id)
      );
      setProjects(uniqueProjects);
      
      const allEntries = await localDB.TimeEntry.list();
      const projectIds = uniqueProjects.map(p => p.project_id);
      
      const processedEntries = allEntries
        .filter(entry => projectIds.includes(entry.project_id))
        .map(entry => ({
          ...entry,
          project: uniqueProjects.find(p => p.project_id === entry.project_id)
        }))
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
      
      setTimeEntries(processedEntries);
    } catch (error) {
      console.error("Error loading timer data:", error);
    }
  }, [lastFetchTime]);

  const loadCurrentCat = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedCatId = getSelectedCatId();
      
      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats?.find(cat => cat.cat_trucker_id === selectedCatId);
        
        if (selectedCat) {
          setCurrentCat(selectedCat);
          await debouncedLoadData(selectedCat);
        } else {
          setCurrentCat(null);
        }
      } else {
        setCurrentCat(null);
      }
    } catch (error) {
      console.error("Error loading current cat for Timer:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedLoadData]);

  useEffect(() => {
    loadCurrentCat();
    const handleCatChange = () => loadCurrentCat();
    window.addEventListener("cat-session-changed", handleCatChange);
    return () => window.removeEventListener("cat-session-changed", handleCatChange);
  }, [loadCurrentCat]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get('project_id');
    if (projectId) {
      setProjectFromId(projectId);
    }
  }, [location.search, setProjectFromId]);

  const handleStart = () => {
    if (!selectedProject) return;
    // Clear any existing interval before starting a new one
    if (timerRef.current) clearInterval(timerRef.current);

    // Use a local start timestamp so the interval closure never sees a stale/null state
    const localStart = Date.now() - (elapsedTime || 0); // Use 0 if elapsedTime is not set yet
    setStartTime(localStart);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - localStart);
    }, 1000);
  };

  const handlePause = () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    
    handlePause();
    
    try {
      if (elapsedTime === 0) return;
      
      const durationMinutes = Math.floor(elapsedTime / 1000 / 60);
      const endTime = new Date();
      const timeEntry = {
        project_id: selectedProject.project_id,
        start_time: new Date(endTime.getTime() - elapsedTime).toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        description: description,
        date: format(endTime, "yyyy-MM-dd"),
      };
      
      await localDB.TimeEntry.create(timeEntry);
      
      setElapsedTime(0);
      setDescription('');
      debouncedLoadData(currentCat);
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await localDB.TimeEntry.delete(id);
      setTimeEntries(timeEntries.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleContinueEntry = (entry) => {
    setSelectedProject(entry.project);
    setDescription(entry.description || "");
    setElapsedTime(0);
    handleStart();
  };

  const handleOpenEditDialog = (entry) => {
    setEntryToEdit(entry);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenAddDialog = () => {
      setEntryToEdit(null); // Ensure we're creating a new one
      setIsEditDialogOpen(true);
  };

  const handleSaveEntry = async (updatedEntryData) => {
    try {
      if (updatedEntryData.id) {
        await localDB.TimeEntry.update(updatedEntryData.id, updatedEntryData);
      } else {
        await localDB.TimeEntry.create(updatedEntryData);
      }
      setIsEditDialogOpen(false);
      setEntryToEdit(null);
      debouncedLoadData(currentCat);
    } catch (error) {
      console.error("Error saving time entry:", error);
    }
  };

  const adjustTime = (amount) => {
    setElapsedTime(prev => Math.max(0, prev + amount));
    if (isRunning) {
        // When adjusting, we need to adjust the effective start time as well
        // so the next tick calculates from the adjusted total.
        // If the timer is running, startTime is Date.now() - elapsedTime, so:
        // newStartTime = Date.now() - newElapsedTime
        // (Date.now() - (prev + amount))
        setStartTime(prev => prev - amount); // this effectively shifts the startTime by 'amount'
    }
  };

  const getTimerText = (key) => {
    const text = getText(`timer.${key}`);
    return text.replace('%CAT%', (currentCat && currentCat.nickname) || 'unknown');
  };

  // Ensure timer is cleaned up when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <div className="text-center p-12">Loading...</div>;
  }

  if (!currentCat) {
    return (
      <div className="text-center p-12">
        Please select a cat trucker from the welcome screen to start tracking time.
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-full overflow-x-hidden">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">{getText("timer.title")}</h1>
          <p className="text-amber-700 mt-1">
            {currentCat ? 
              getText("timer.subtitle").replace('%CAT%', currentCat.nickname) : 
              getText("timer.subtitle").replace('%CAT%', '...')}
          </p>
        </div>
      </div>

      <div className="space-y-6 w-full max-w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full overflow-x-hidden">
            <ProjectSelector 
              projects={projects} 
              selectedProject={selectedProject} 
              onSelectProject={setSelectedProject} 
            />
            
            {!selectedProject && (
              <Link to={createPageUrl("Projects")}>
                <Button size="sm" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {getText("timer.newRoute")}
                </Button>
              </Link>
            )}
          </div>
          
          {selectedProject ? (
            <TimerControls 
              isRunning={isRunning}
              elapsedTime={elapsedTime}
              description={description}
              setDescription={setDescription}
              handleStart={handleStart}
              handlePause={handlePause}
              handleSave={handleSave}
              currentCat={currentCat}
              getTimerText={getTimerText}
              adjustTime={adjustTime}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 sm:p-10 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-center">
              <img 
                src={(currentCat && currentCat.avatar_url) || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"}
                alt={(currentCat && currentCat.nickname) || "Ready to drive"}
                className="w-28 h-28 rounded-full object-cover border-4 border-amber-200 mb-4" 
              />
              <p className="text-amber-700 mb-4">
                {getText("timer.selectRouteToStart")}
              </p>
              <Link to={createPageUrl("Projects")}>
                <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-100">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {getText("timer.createNewRoute")}
                </Button>
              </Link>
            </div>
          )}
          
          <RecentEntries 
            entries={timeEntries}
            onDelete={handleDeleteEntry}
            onContinue={handleContinueEntry}
            onEdit={handleOpenEditDialog}
            onAddManual={handleOpenAddDialog}
            currentCat={currentCat}
          />
        </div>

      <EditTimeEntryDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEntryToEdit(null);
        }}
        entry={entryToEdit}
        projects={projects}
        onSave={handleSaveEntry}
      />
    </div>
  );
}