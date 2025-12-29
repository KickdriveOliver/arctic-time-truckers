import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "../utils/timeUtils";
import { getText } from "../utils/translations";

export default function Stats({ todayHours, weekHours, monthHours, todayCount, weekCount, monthCount }) {
  const stats = [
    { 
      label: getText("dashboard.todayMetric"), 
      value: formatDuration(todayHours),
      count: todayCount,
      color: "bg-gradient-to-br from-amber-100 to-orange-100",
      textColor: "text-amber-800",
      icon: "🚛"
    },
    { 
      label: getText("dashboard.weekMetric"), 
      value: formatDuration(weekHours),
      count: weekCount,
      color: "bg-gradient-to-br from-amber-100 to-amber-200",
      textColor: "text-amber-800",
      icon: "❄️"
    },
    { 
      label: getText("dashboard.monthMetric"), 
      value: formatDuration(monthHours),
      count: monthCount,
      color: "bg-gradient-to-br from-orange-100 to-amber-100",
      textColor: "text-amber-800",
      icon: "🐾"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle at center, ${stat.color}, transparent)`
              }}
            />
            <div className="flex flex-col items-center relative z-10">
              <div className={`rounded-xl p-3 mb-3 ${stat.color} shadow-inner border border-amber-200/50`}>
                <span className="text-3xl filter drop-shadow-sm">{stat.icon}</span>
              </div>
              <p className={`text-lg font-bold mb-4 ${stat.textColor}`}>{stat.label}</p>
              
              <div className="w-full grid grid-cols-3 gap-1 sm:gap-2 text-center divide-x divide-amber-100">
                <div className="flex flex-col items-center px-0.5 sm:px-1">
                    <div className="h-8 flex items-center justify-center mb-1 w-full">
                        <span className="text-[10px] sm:text-xs text-amber-600 uppercase font-semibold leading-tight px-1">
                            {getText("reports.time")}
                        </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-amber-900 leading-tight whitespace-nowrap">
                        {stat.value}
                    </span>
                </div>
                <div className="flex flex-col items-center px-0.5 sm:px-1">
                    <div className="h-8 flex items-center justify-center mb-1 w-full">
                        <span className="text-[10px] sm:text-xs text-amber-600 uppercase font-semibold leading-tight px-1">
                            {getText("dashboard.deliveries")}
                        </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-amber-900 leading-tight">
                        {stat.count}
                    </span>
                </div>
                <div className="flex flex-col items-center px-0.5 sm:px-1">
                    <div className="h-8 flex items-center justify-center mb-1 w-full">
                        <span className="text-[10px] sm:text-xs text-amber-600 uppercase font-semibold leading-tight px-1">
                            {getText("dashboard.napsTaken")}
                        </span>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-amber-900 leading-tight whitespace-nowrap">
                        {getText("dashboard.tooFew")}
                    </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}