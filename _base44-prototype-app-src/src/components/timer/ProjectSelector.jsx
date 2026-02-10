
import React from 'react';
import { Check, PlusCircle, Truck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getText } from "../utils/translations";

export default function ProjectSelector({ projects, selectedProject, onSelectProject }) {
  // Remove duplicates based on project_id and name
  const uniqueProjects = projects.reduce((acc, project) => {
    const existingProject = acc.find(p => 
      p.project_id === project.project_id || 
      (p.name === project.name && p.cat_trucker_id === project.cat_trucker_id)
    );
    
    if (!existingProject) {
      acc.push(project);
    }
    
    return acc;
  }, []);

  const activeProjects = uniqueProjects.filter(p => !p.is_archived);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full md:w-auto justify-between border-amber-200 bg-amber-50 hover:bg-amber-100"
          style={{ 
            borderColor: selectedProject && selectedProject.color, 
            color: selectedProject && selectedProject.color
          }}
        >
          {selectedProject ? (
            <span className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: selectedProject.color }} 
              />
              {selectedProject.name}
            </span>
          ) : (
            <span className="text-amber-700">
              <Truck className="w-4 h-4 mr-2 inline-block" />
              {getText("timer.selectProject")}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-amber-50 border-amber-200">
        {activeProjects.map(project => (
          <DropdownMenuItem 
            key={`${project.project_id}-${project.id}`} // Use both IDs to ensure uniqueness
            onClick={() => onSelectProject(project)}
            className="justify-between text-amber-900 hover:bg-amber-100"
          >
            <span className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: project.color }} 
              />
              {project.name}
            </span>
            {selectedProject && selectedProject.project_id === project.project_id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        {activeProjects.length === 0 && (
          <DropdownMenuItem disabled className="text-amber-500 italic">
            No routes available
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-amber-200" />
        <Link to={createPageUrl("Projects")}>
          <DropdownMenuItem className="text-amber-700 hover:bg-amber-100">
            <PlusCircle className="h-4 w-4 mr-2" />
            {getText("timer.createNewRoute")}
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
