import React, { useState, useEffect, useCallback } from "react";
import { localDB } from "@/components/utils/localDB";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { getText } from "../components/utils/translations";
import { getSelectedCatId } from "../components/utils/catSession"; 
import { formatDuration } from "../components/utils/timeUtils";

import TimeLog from "../components/reports/TimeLog";
import ProjectSummary from "../components/reports/ProjectSummary";

export default function Reports() {
  const [currentCat, setCurrentCat] = useState(null);
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (cat) => {
    try {
      const allProjects = await localDB.Project.list();
      const catProjects = allProjects.filter(p => p.cat_trucker_id === cat.cat_trucker_id);
      setProjects(catProjects);

      const allEntries = await localDB.TimeEntry.list();
      
      const projectIds = catProjects.map(p => p.project_id);
      
      const processedEntries = allEntries
        .filter(entry => projectIds.includes(entry.project_id))
        .map(entry => ({
          ...entry,
          project: catProjects.find(p => p.project_id === entry.project_id)
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTimeEntries(processedEntries);
    } catch (error) {
      console.error("Error loading data:", error);
      setProjects([]);
      setTimeEntries([]);
    }
  }, []);

  const loadCurrentCat = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedCatId = getSelectedCatId(); 
      
      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats?.find(cat => cat.cat_trucker_id === selectedCatId);

        if (selectedCat) {
          setCurrentCat(selectedCat);
          await loadData(selectedCat);
        } else {
          console.error(`Cat with ID ${selectedCatId} not found.`);
          setCurrentCat(null);
          setProjects([]);
          setTimeEntries([]);
        }
      } else {
        console.log("No cat selected for Reports page");
        setCurrentCat(null);
        setProjects([]);
        setTimeEntries([]);
      }
    } catch (error) {
      console.error("Error loading current cat for Reports:", error);
      setCurrentCat(null);
      setProjects([]);
      setTimeEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadCurrentCat();

    const handleCatChange = () => {
      loadCurrentCat();
    };
    
    window.addEventListener("cat-session-changed", handleCatChange);
    return () => {
      window.removeEventListener("cat-session-changed", handleCatChange);
    };
  }, [loadCurrentCat]);

  const getFilteredEntries = () => {
    let filtered = timeEntries;
    
    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter(entry => entry.project_id === selectedProject);
    }
    
    // Filter by time period
    if (selectedPeriod !== "all") {
      const now = new Date();
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        
        if (selectedPeriod === "thisWeek") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return entryDate >= startOfWeek;
        } 
        else if (selectedPeriod === "lastWeek") {
          const startOfLastWeek = new Date(now);
          startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
          startOfLastWeek.setHours(0, 0, 0, 0);
          const endOfLastWeek = new Date(startOfLastWeek);
          endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
          return entryDate >= startOfLastWeek && entryDate < endOfLastWeek;
        }
        else if (selectedPeriod === "twoWeeksAgo") {
          const startOfTwoWeeksAgo = new Date(now);
          startOfTwoWeeksAgo.setDate(now.getDate() - now.getDay() - 14);
          startOfTwoWeeksAgo.setHours(0, 0, 0, 0);
          const endOfTwoWeeksAgo = new Date(startOfTwoWeeksAgo);
          endOfTwoWeeksAgo.setDate(startOfTwoWeeksAgo.getDate() + 7);
          return entryDate >= startOfTwoWeeksAgo && entryDate < endOfTwoWeeksAgo;
        }
        else if (selectedPeriod === "thisMonth") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return entryDate >= startOfMonth;
        }
        else if (selectedPeriod === "lastMonth") {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return entryDate >= startOfLastMonth && entryDate < startOfThisMonth;
        }
        else if (selectedPeriod === "twoMonthsAgo") {
          const startOfTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return entryDate >= startOfTwoMonthsAgo && entryDate < startOfLastMonth;
        }
        
        return true;
      });
    }
    
    return filtered;
  };

  const handleExportCsv = () => {
    const filtered = getFilteredEntries();
    if (filtered.length === 0) return;

    try {
      const headers = [
        "Date",
        "Project",
        "Start Time",
        "End Time",
        "Duration (minutes)",
        "Description"
      ];
      const data = filtered.map(entry => [
        entry.date,
        (entry.project && entry.project.name) || "Unknown Project",
        format(new Date(entry.start_time), "HH:mm"),
        format(new Date(entry.end_time), "HH:mm"),
        entry.duration_minutes,
        entry.description || ""
      ]);
      
      const csvContent = [
        headers.join(","),
        ...data.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `time-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handleExportStatsCsv = () => {
    const filtered = getFilteredEntries();
    if (filtered.length === 0) return;

    try {
      // Calculate project summaries (same logic as ProjectSummary component)
      const projectSummaries = filtered.reduce((acc, entry) => {
        if (!entry.project) return acc;
        
        if (!acc[entry.project_id]) {
          acc[entry.project_id] = {
            name: entry.project.name,
            totalMinutes: 0,
            count: 0
          };
        }
        
        acc[entry.project_id].totalMinutes += entry.duration_minutes;
        acc[entry.project_id].count += 1;
        return acc;
      }, {});

      const summaryData = Object.values(projectSummaries)
        .sort((a, b) => b.totalMinutes - a.totalMinutes);

      const totalMinutes = summaryData.reduce((sum, project) => sum + project.totalMinutes, 0);

      const headers = [
        "Arctic Route",
        "Total Hours",
        "Total Deliveries",
        "Percentage of Total"
      ];

      const data = summaryData.map(project => [
        project.name,
        formatDuration(project.totalMinutes), // e.g. "2h 30m"
        project.count,
        `${Math.round((project.totalMinutes / totalMinutes) * 100)}%`
      ]);

      // Add a total row at the bottom
      data.push([
        "TOTAL",
        formatDuration(totalMinutes),
        filtered.length,
        "100%"
      ]);
      
      const csvContent = [
        headers.join(","),
        ...data.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `stats-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting Stats CSV:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="animate-bounce">
          <span className="text-4xl">🚛</span>
        </div>
        <div className="text-amber-700 italic">
          Pringles is gathering the logbooks...
        </div>
      </div>
    );
  }

  const filteredEntries = getFilteredEntries();
  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration_minutes, 0);

  const catQuoteRemark = totalHours > 600 ? getText("reports.summary.remarks.high") :
                         totalHours > 300 ? getText("reports.summary.remarks.medium") :
                         getText("reports.summary.remarks.low");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">{getText("reports.title")}</h1>
          <p className="text-amber-700 mt-1 flex items-center gap-2">
            <span>📋</span>
            {currentCat ? 
              getText("reports.subtitle").replace('%CAT%', currentCat.nickname) : 
              getText("reports.subtitle").replace('%CAT%', 'Pringles')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleExportStatsCsv}
            variant="outline"
            disabled={filteredEntries.length === 0}
            className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-100 group"
          >
            <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" /> 
            {getText("reports.exportStats")}
          </Button>
          <Button 
            onClick={handleExportCsv}
            variant="outline"
            disabled={filteredEntries.length === 0}
            className="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-100 group"
          >
            <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" /> 
            {getText("reports.exportLog")}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🗺️</span>
              <label className="block text-lg font-medium text-amber-800">
                {getText("reports.routeSelection")}
              </label>
            </div>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
            >
              <SelectTrigger className="w-full border-amber-200 bg-white text-amber-900">
                <SelectValue placeholder={projects.length === 0 ? getText("reports.noRoutesPlaceholder") : getText("reports.selectRoutePlaceholder")} />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border-amber-200">
                <SelectItem value="all" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>🌟</span>
                    {getText("reports.allRoutes")}
                  </div>
                </SelectItem>
                {projects.map(project => (
                  <SelectItem 
                    key={project.project_id} 
                    value={project.project_id} 
                    className="text-amber-900"
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2 inline-block" 
                        style={{ backgroundColor: project.color }} 
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📅</span>
              <label className="block text-lg font-medium text-amber-800">
                {getText("reports.timeSelection")}
              </label>
            </div>
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-full border-amber-200 bg-white text-amber-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border-amber-200">
                <SelectItem value="all" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>🌍</span>
                    {getText("reports.allTime")}
                  </div>
                </SelectItem>
                <SelectItem value="thisWeek" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>📆</span>
                    {getText("reports.thisWeek")}
                  </div>
                </SelectItem>
                <SelectItem value="lastWeek" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    {getText("reports.lastWeek")}
                  </div>
                </SelectItem>
                <SelectItem value="twoWeeksAgo" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    {getText("reports.twoWeeksAgo")}
                  </div>
                </SelectItem>
                <SelectItem value="thisMonth" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>🗓️</span>
                    {getText("reports.thisMonth")}
                  </div>
                </SelectItem>
                <SelectItem value="lastMonth" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>📖</span>
                    {getText("reports.lastMonth")}
                  </div>
                </SelectItem>
                <SelectItem value="twoMonthsAgo" className="text-amber-900">
                  <div className="flex items-center gap-2">
                    <span>📚</span>
                    {getText("reports.twoMonthsAgo")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">📖</span>
            <h2 className="text-xl font-semibold text-amber-900">{getText("reports.logbookTitle")}</h2>
            <div className="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
              {getText("reports.adventureCount").replace('%COUNT%', filteredEntries.length)}
            </div>
            <div className="ml-4 flex-1 border-t border-amber-200"></div>
          </div>
          {filteredEntries.length > 0 ? (
            <TimeLog entries={filteredEntries} currentCat={currentCat} />
          ) : (
            <div className="text-center py-12 border rounded-lg border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              {currentCat && (
                <img 
                  src={currentCat.avatar_url}
                  alt={getText("reports.noAdventures")}
                  className="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-2 border-amber-200"
                />
              )}
              <p className="text-amber-700 mb-2">{getText("reports.noAdventures")}</p>
              <p className="text-amber-600 text-sm italic">
                {getText("reports.noAdventuresQuote")}
              </p>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">📊</span>
            <h2 className="text-xl font-semibold text-amber-900">{getText("reports.statsTitle")}</h2>
            <div className="ml-4 flex-1 border-t border-amber-200"></div>
          </div>
          <ProjectSummary entries={filteredEntries} />
          {filteredEntries.length > 0 && (
            <div className="mt-6 p-4 bg-amber-100/50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <img 
                  src={currentCat && currentCat.avatar_url}
                  alt={currentCat && currentCat.nickname}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                />
                <div>
                  <p className="text-amber-800 italic text-sm">
                    {getText("reports.summary.quote").replace("%REMARK%", catQuoteRemark)}
                  </p>
                  <p className="text-amber-600 text-xs mt-1">
                    - {(currentCat && currentCat.nickname) || "Your Arctic Trucker"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}