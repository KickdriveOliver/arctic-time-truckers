import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDuration, formatTime } from "../utils/timeUtils";
import { getText } from "../utils/translations";
import { Clock, Calendar } from 'lucide-react';

export default function TimeLog({ entries, currentCat }) {
  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = { total: 0, entries: [] };
    }
    acc[date].entries.push(entry);
    acc[date].total += entry.duration_minutes;
    return acc;
  }, {});

  const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <div key={date} className="space-y-3">
          <div className="flex justify-between items-baseline border-b border-amber-200 pb-2">
            <h3 className="font-medium text-amber-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="text-sm font-semibold text-amber-900">
              <span className="font-normal text-amber-700">{getText("reports.logTable.total")}: </span>
              {formatDuration(entriesByDate[date].total)}
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block border border-amber-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-amber-100/80">
                <TableRow>
                  <TableHead className="w-[30%] text-amber-900">{getText("reports.logTable.route")}</TableHead>
                  <TableHead className="w-[20%] text-amber-900">{getText("reports.logTable.time")}</TableHead>
                  <TableHead className="w-[15%] text-amber-900">{getText("reports.logTable.duration")}</TableHead>
                  <TableHead className="w-[35%] text-amber-900">{getText("reports.logTable.cargo")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entriesByDate[date].entries.map(entry => (
                  <TableRow key={entry.id} className="hover:bg-amber-100/50">
                    <TableCell className="font-medium text-amber-900">
                      <div className="flex items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: entry.project?.color }}
                        />
                        <span className="truncate">{entry.project?.name || getText("common.unknownRoute")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-amber-800">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</TableCell>
                    <TableCell className="font-medium text-amber-800">{formatDuration(entry.duration_minutes)}</TableCell>
                    <TableCell className="text-amber-800 text-sm italic">
                      <p className="truncate">{entry.description || getText("common.noCargoDetails")}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {entriesByDate[date].entries.map(entry => (
              <Card key={entry.id} className="bg-white/80 border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center font-semibold text-amber-900">
                      <div
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: entry.project?.color }}
                      />
                      <span className="truncate">{entry.project?.name || getText("common.unknownRoute")}</span>
                  </div>
                  <div className="text-sm font-medium text-amber-900 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    {formatDuration(entry.duration_minutes)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3 text-sm">
                  <p className="text-amber-700 mb-2">
                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                  </p>
                  {entry.description && (
                    <p className="text-amber-800 italic bg-amber-100/50 p-2 rounded-md">
                      {entry.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}