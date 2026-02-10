
import React, { useState, useEffect, useCallback } from "react";
import { localDB } from "@/components/utils/localDB";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FolderPlus, Archive, ArchiveRestore } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProjectForm from "../components/projects/ProjectForm";
import ProjectCard from "../components/projects/ProjectCard";
import { getText } from "../components/utils/translations";
import { getSelectedCatId } from "../components/utils/catSession";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState(null);

  const loadProjects = useCallback(async () => {
    if (!currentCat?.cat_trucker_id) {
      setProjects([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const allProjects = await localDB.Project.list();
      const catProjects = allProjects.filter(p => p.cat_trucker_id === currentCat.cat_trucker_id);
      setProjects(catProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentCat]);

  const loadCurrentCat = useCallback(async () => {
    try {
      setIsLoading(true);
      const selectedCatId = getSelectedCatId();
      
      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats?.find(cat => cat.cat_trucker_id === selectedCatId);
        setCurrentCat(selectedCat || null);
      } else {
        setCurrentCat(null);
      }
    } catch (error) {
      console.error("Error loading current cat:", error);
      setCurrentCat(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentCat();
    const handleCatChange = () => loadCurrentCat();
    window.addEventListener("cat-session-changed", handleCatChange);
    return () => window.removeEventListener("cat-session-changed", handleCatChange);
  }, [loadCurrentCat]);

  useEffect(() => {
    if(currentCat) {
      loadProjects();
    }
  }, [currentCat, loadProjects]);

  const handleCreateProject = async (formData) => {
    if (!currentCat || !currentCat.cat_trucker_id) return;
    
    try {
      const project_id = `project_${Date.now()}`;
      await localDB.Project.create({
        ...formData,
        project_id,
        cat_trucker_id: currentCat.cat_trucker_id
      });
      setShowForm(false);
      loadProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleUpdateProject = async (formData) => {
    if (!activeProject || !currentCat) return;
    
    try {
      await localDB.Project.update(activeProject.id, {
        ...formData,
        cat_trucker_id: currentCat.cat_trucker_id
      });
      setShowForm(false);
      setActiveProject(null);
      loadProjects();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleArchiveProject = async (projectId, isArchived) => {
    // Note: The ProjectCard will now pass project_id, not the internal 'id'
    const projectToUpdate = projects.find(p => p.project_id === projectId);
    if (!projectToUpdate) return;
    
    try {
      await localDB.Project.update(projectToUpdate.id, { is_archived: isArchived });
      loadProjects();
    } catch (error) {
      console.error("Error archiving/restoring project:", error);
    }
  };

  const confirmDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await localDB.Project.delete(projectToDelete.id);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      setShowForm(false); // Close form if delete was initiated from there
      setActiveProject(null); // Clear active project
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const activeProjects = projects.filter(p => !p.is_archived);
  const archivedProjects = projects.filter(p => p.is_archived);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">{getText("projects.title")}</h1>
          <p className="text-amber-700 mt-1">{getText("projects.subtitle")}</p>
        </div>
        <Button onClick={() => { setActiveProject(null); setShowForm(true); }} className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
          <FolderPlus className="mr-2 h-5 w-5" />
          {getText("projects.new")}
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-amber-900">
              {activeProject ? getText("projects.editTitle") : getText("projects.newTitle")}
            </DialogTitle>
            <DialogDescription className="text-amber-700">
              {activeProject ? getText("projects.editDesc") : getText("projects.newDesc")}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            project={activeProject}
            onSave={activeProject ? handleUpdateProject : handleCreateProject}
            onCancel={() => { setShowForm(false); setActiveProject(null); }}
            onDelete={() => confirmDeleteProject(activeProject)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-amber-50 border-amber-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-900">
              {getText("projects.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-amber-800">
              {getText("projects.deleteDesc", { projectName: projectToDelete?.name || "this project" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-amber-200 text-amber-700 hover:bg-amber-100">
              {getText("projects.keepProject")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {getText("projects.deleteProject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-end gap-2">
        <label htmlFor="show-archived" className="text-sm font-medium text-amber-800">{getText("projects.showArchived")}</label>
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={setShowArchived}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-amber-900">{getText("projects.active")}</h2>
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map(p => (
              <ProjectCard 
                key={p.id}
                project={p} 
                onEdit={() => { setActiveProject(p); setShowForm(true); }} 
                onArchive={() => handleArchiveProject(p.project_id, true)} 
                onDelete={() => confirmDeleteProject(p)} // Added onDelete
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-amber-600 italic">{getText("projects.noActive")}</p>
        )}
      </div>

      {showArchived && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-amber-900">{getText("projects.archived")}</h2>
          {archivedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedProjects.map(p => (
                <ProjectCard 
                  key={p.id}
                  project={p} 
                  onEdit={() => { setActiveProject(p); setShowForm(true); }} 
                  onRestore={() => handleArchiveProject(p.project_id, false)} // Updated to pass project_id
                  onDelete={() => confirmDeleteProject(p)} // Added onDelete
                />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-amber-600 italic">{getText("projects.noArchivedQuote")}</p>
          )}
        </div>
      )}
    </div>
  );
}
