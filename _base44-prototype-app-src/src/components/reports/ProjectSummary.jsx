
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatDuration } from "../utils/timeUtils";
import { getText } from "../utils/translations";

export default function ProjectSummary({ entries }) {
  // Calculate project summaries
  const projectSummaries = entries.reduce((acc, entry) => {
    if (!entry.project) return acc;
    
    if (!acc[entry.project_id]) {
      acc[entry.project_id] = {
        id: entry.project_id,
        name: entry.project.name,
        color: entry.project.color,
        totalMinutes: 0
      };
    }
    
    acc[entry.project_id].totalMinutes += entry.duration_minutes;
    return acc;
  }, {});

  const summaryData = Object.values(projectSummaries)
    .filter(project => project.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  const totalMinutes = summaryData.reduce((sum, project) => sum + project.totalMinutes, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = Math.round((data.totalMinutes / totalMinutes) * 100);
      return (
        <div className="bg-amber-50 p-3 shadow-md rounded-md border border-amber-200">
          <p className="font-medium text-amber-900">{data.name}</p>
          <p className="text-amber-800">{formatDuration(data.totalMinutes)}</p>
          <p className="text-amber-600 text-sm">
            {getText("reports.summary.ofTotal").replace('%PERCENTAGE%', percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (summaryData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-amber-700">{getText("reports.noData")}</p>
            <p className="text-amber-600 text-sm italic mt-2">
              {getText("reports.noDataQuote")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="totalMinutes"
                >
                  {summaryData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-amber-900">
              {getText("reports.totalHours")}: {formatDuration(totalMinutes)}
            </p>
            <div className="space-y-4 mt-4">
              {summaryData.map(project => (
                <div key={project.id} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: project.color }} 
                  />
                  <span className="mr-2 flex-1 text-amber-800">{project.name}</span>
                  <span className="font-medium mr-2 text-amber-900">
                    {formatDuration(project.totalMinutes)}
                  </span>
                  <span className="text-amber-600 text-sm w-16 text-right">
                    {Math.round((project.totalMinutes / totalMinutes) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
