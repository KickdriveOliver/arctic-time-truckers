import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDuration } from "../utils/timeUtils";
import { getText } from "../utils/translations";
import { Truck } from 'lucide-react';

export default function ProjectCard({ project, stats }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: project.color }}
            />
            <CardTitle className="text-lg font-semibold text-amber-900">{project.name}</CardTitle>
          </div>
          <Link 
            to={`${createPageUrl("Timer")}?project=${project.id}`}
            className="text-amber-600 hover:text-amber-800 transition-colors"
          >
            <Truck className="h-5 w-5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex justify-between items-center mt-2">
          <div>
            <span className="text-sm text-amber-700">{getText("dashboard.projectCard.today")}</span>
            <p className="font-medium text-amber-900">{formatDuration(stats.today || 0)}</p>
          </div>
          <div>
            <span className="text-sm text-amber-700">{getText("dashboard.projectCard.week")}</span>
            <p className="font-medium text-amber-900">{formatDuration(stats.week || 0)}</p>
          </div>
          <div>
            <span className="text-sm text-amber-700">{getText("dashboard.projectCard.month")}</span>
            <p className="font-medium text-amber-900">{formatDuration(stats.month || 0)}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            to={`${createPageUrl("Reports")}?project=${project.id}`}
            className="flex items-center text-sm text-amber-600 hover:text-amber-800"
          >
            {getText("dashboard.projectCard.viewLogs")}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}