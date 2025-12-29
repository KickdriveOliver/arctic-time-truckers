
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Archive, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getText } from "../utils/translations";

export default function ProjectCard({ project, onArchive, onEdit, onDelete }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-200 backdrop-blur-sm">
      <CardHeader className="pb-2 relative">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-10"
          style={{
            backgroundColor: project.color
          }}
        />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <div 
              className={`w-3 h-3 rounded-full mr-2 shadow-inner border border-white/50`}
              style={{ backgroundColor: project.color }}
            />
            <CardTitle className="text-lg font-semibold text-amber-900">
              {project.name}
              {project.is_archived && (
                <span className="ml-2 text-xs text-amber-500 font-normal">
                  ({getText("projects.archivedTabs")})
                </span>
              )}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`${createPageUrl("Timer")}?project=${project.project_id}`}>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-amber-200 hover:bg-amber-100 transition-all duration-200 hover:scale-110"
              >
                <Truck className="h-4 w-4 text-amber-700" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-amber-700 hover:bg-amber-100 transition-all duration-200 hover:scale-110"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-amber-50/95 border-amber-200 backdrop-blur-sm">
                <DropdownMenuItem onClick={() => onEdit(project)} className="text-amber-900 hover:bg-amber-100">
                  <Edit className="h-4 w-4 mr-2" />
                  {getText("projects.editTitle")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onArchive(project.project_id, !project.is_archived)}
                  className="text-amber-900 hover:bg-amber-100"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {project.is_archived ? "Reactivate Route" : "Retire Route"}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-amber-200" />
                <DropdownMenuItem 
                  onClick={() => onDelete(project.project_id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {getText("projects.deleteRoute")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {project.description ? (
          <p className="text-amber-700 text-sm mt-2 line-clamp-2">{project.description}</p>
        ) : (
          <p className="text-amber-500 text-sm mt-2 italic">
            No route description available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
