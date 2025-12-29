import React, { useState, useEffect, useCallback } from "react";
import { localDB } from "@/components/utils/localDB";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, PlusCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getTimeRanges } from "../components/utils/timeUtils";
import { getText } from "../components/utils/translations";
import { getSelectedCatId } from "../components/utils/catSession"; 
import { exportData } from "@/components/utils/dataManager";
import { format } from "date-fns";

import Stats from "../components/dashboard/Stats";
import ProjectCard from "../components/dashboard/ProjectCard";

const BACKUP_STORAGE_KEY = 'pringles_backup_settings';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projectStats, setProjectStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState(null); 
  const [mainStats, setMainStats] = useState({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 }); 
  const [isBackupDue, setIsBackupDue] = useState(false);

  // Check if backup is due
  const checkBackupStatus = () => {
    try {
      const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!stored) return false;
      
      const settings = JSON.parse(stored);
      if (settings.schedule === 'off' || !settings.lastBackupDate) {
        return settings.schedule !== 'off';
      }

      const lastBackup = new Date(settings.lastBackupDate);
      const now = new Date();
      const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

      if (settings.schedule === 'daily' && daysSinceBackup >= 1) return true;
      if (settings.schedule === 'weekly' && daysSinceBackup >= 7) return true;
      if (settings.schedule === 'monthly' && daysSinceBackup >= 30) return true;
      
      return false;
    } catch (error) {
      console.error('Error checking backup status:', error);
      return false;
    }
  };

  const handleQuickBackup = async () => {
    try {
      // Get current backup settings
      const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
      const settings = stored ? JSON.parse(stored) : { schedule: 'off' };
      
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
      const catName = currentCat?.nickname || 'AllCats';
      const typeLabel = settings.schedule === 'off' ? 'Manual' : settings.schedule.charAt(0).toUpperCase() + settings.schedule.slice(1);
      
      // Create custom filename
      const customFilename = `PringlesTimeTrucking_Backup_${catName}_${typeLabel}_${timestamp}.json`;
      
      await exportData(customFilename);
      
      // Update last backup date
      const updatedSettings = {
        ...settings,
        lastBackupDate: new Date().toISOString(),
      };
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updatedSettings));
      
      setIsBackupDue(false); // Mark backup as no longer due after successful quick backup
    } catch (error) {
      console.error("Error creating backup:", error);
      alert(getText("backup.exportError") || "Backup export failed. Please try again.");
    }
  };

  const calculateStats = useCallback((projects, entries, ranges) => {
    const projectStatsMap = {};
    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    projects.forEach(project => {
      projectStatsMap[project.project_id] = { 
        today: 0,
        week: 0,
        month: 0
      };
    });

    entries.forEach(entry => {
      const startTime = new Date(entry.start_time);
      const today = new Date(ranges.today.start) <= startTime && startTime <= new Date(ranges.today.end);
      const thisWeek = new Date(ranges.week.start) <= startTime && startTime <= new Date(ranges.week.end);
      const thisMonth = new Date(ranges.month.start) <= startTime && startTime <= new Date(ranges.month.end);

      if (projectStatsMap[entry.project_id]) {
        if (today) {
          projectStatsMap[entry.project_id].today += entry.duration_minutes;
          todayTotal += entry.duration_minutes;
          todayCount++;
        }
        if (thisWeek) {
          projectStatsMap[entry.project_id].week += entry.duration_minutes;
          weekTotal += entry.duration_minutes;
          weekCount++;
        }
        if (thisMonth) {
          projectStatsMap[entry.project_id].month += entry.duration_minutes;
          monthTotal += entry.duration_minutes;
          monthCount++;
        }
      }
    });

    setProjectStats(projectStatsMap);
    setMainStats({ todayTotal, weekTotal, monthTotal, todayCount, weekCount, monthCount });
  }, []); 

  const fetchAndProcessCatData = useCallback(async (cat) => {
    if (!cat || !cat.cat_trucker_id) {
      setProjects([]);
      setTimeEntries([]);
      setProjectStats({});
      setMainStats({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
      return;
    }

    try {
      const allProjects = await localDB.Project.list();
      const projectsData = allProjects.filter(p => p.cat_trucker_id === cat.cat_trucker_id);
      const activeProjects = projectsData.filter(p => !p.is_archived);
      setProjects(activeProjects);

      const ranges = getTimeRanges();
      const projectIds = activeProjects.map(p => p.project_id);

      const allEntries = await localDB.TimeEntry.list();
      const catEntries = allEntries.filter(entry =>
        projectIds.includes(entry.project_id)
      );

      setTimeEntries(catEntries);
      calculateStats(activeProjects, catEntries, ranges);
    } catch (error) {
      console.error("Error fetching and processing cat data:", error);
      setTimeEntries([]);
      setProjects([]);
      setProjectStats({});
      setMainStats({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
    }
  }, [calculateStats]); 

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedCatId = getSelectedCatId();

      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats && cats.find(cat => cat.cat_trucker_id === selectedCatId);

        if (selectedCat) {
          setCurrentCat(selectedCat);
          await fetchAndProcessCatData(selectedCat);
        } else {
          console.warn("Selected cat ID found in session but cat not in database. Clearing selection.");
          setCurrentCat(null);
          setProjects([]);
          setTimeEntries([]);
          setProjectStats({});
          setMainStats({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
        }
      } else {
        setCurrentCat(null);
        setProjects([]);
        setTimeEntries([]);
        setProjectStats({});
        setMainStats({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setCurrentCat(null);
      setProjects([]);
      setTimeEntries([]);
      setProjectStats({});
      setMainStats({ todayTotal: 0, weekTotal: 0, monthTotal: 0, todayCount: 0, weekCount: 0, monthCount: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndProcessCatData]); 

  const [update, setUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChange = () => {
      setUpdate(prev => prev + 1);
    };

    window.addEventListener("language-changed", handleLanguageChange);
    return () => {
      window.removeEventListener("language-changed", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleCatSessionChange = () => {
      loadDashboardData();
    };

    window.addEventListener("cat-session-changed", handleCatSessionChange);

    return () => {
      window.removeEventListener("cat-session-changed", handleCatSessionChange);
    };
  }, [loadDashboardData]); 

  useEffect(() => {
    // Check backup status on mount and set up interval
    setIsBackupDue(checkBackupStatus());
    const backupCheckInterval = setInterval(() => {
      setIsBackupDue(checkBackupStatus());
    }, 60000); // Check every minute

    return () => clearInterval(backupCheckInterval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">{getText("dashboard.title")}</h1>
          <p className="text-amber-700 mt-1">
            {getText("dashboard.subtitle")}
          </p>
        </div>

        <Link to={createPageUrl("Timer")}>
          <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
            <Clock className="mr-2 h-5 w-5" /> {getText("dashboard.startTimer")}
          </Button>
        </Link>
      </div>

      {isBackupDue && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-amber-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>📦 {getText("backup.dueReminder")}</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={handleQuickBackup}
                >
                  {getText("backup.createBackup")}
                </Button>
                <Link to={createPageUrl("BackupRestore")}>
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-lg border animate-pulse">
              <div className="h-5 w-20 bg-gray-200 rounded mb-4" />
              <div className="h-10 w-40 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <Stats
          todayHours={mainStats.todayTotal}
          weekHours={mainStats.weekTotal}
          monthHours={mainStats.monthTotal}
          todayCount={mainStats.todayCount}
          weekCount={mainStats.weekCount}
          monthCount={mainStats.monthCount}
        />
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-amber-900">{getText("dashboard.projectsTitle")}</h2>
          <Link to={createPageUrl("Projects")}>
            <Button variant="ghost" className="text-amber-700 hover:text-amber-800">
              <PlusCircle className="h-4 w-4 mr-2" />
              {getText("dashboard.addProject")}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-lg border animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.project_id}
                project={project}
                stats={projectStats[project.project_id] || {}} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">{getText("dashboard.noProjects")}</h3>
            <p className="text-gray-500 mb-6">{getText("dashboard.noProjectsDesc")}</p>
            <Link to={createPageUrl("Projects")}>
              <Button className="bg-amber-600 hover:bg-amber-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                {getText("dashboard.createProject")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}