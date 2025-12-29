import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Truck, PlusCircle, MoreVertical, Pencil, Play, Trash2, Clock } from "lucide-react";
import { formatDuration, formatTime } from "../utils/timeUtils";
import { getText } from "../utils/translations";

export default function RecentEntries({ entries, onDelete, onContinue, onEdit, onAddManual, currentCat }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const confirmDelete = (entryId) => {
    setEntryToDelete(entryId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      onDelete(entryToDelete);
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

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

  const datesSorted = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));
  
  // Limit to most recent 15 entries total
  const limitedEntries = entries.slice(0, 15);
  const limitedEntriesByDate = limitedEntries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = { total: 0, entries: [] };
    }
    acc[date].entries.push(entry);
    acc[date].total += entry.duration_minutes;
    return acc;
  }, {});
  const limitedDatesSorted = Object.keys(limitedEntriesByDate).sort((a, b) => new Date(b) - new Date(a));

  if (entries.length === 0) {
    return (
      <div className="mt-8">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-3 border-b border-amber-200 flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center text-amber-900">
              <Truck className="h-5 w-5 mr-2 text-amber-700" />
              {getText("timer.recentTitle")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onAddManual} className="text-amber-700 hover:text-amber-800">
              <PlusCircle className="h-4 w-4 mr-2" />
              {getText("timer.addManual")}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <img
                src={(currentCat && currentCat.avatar_url) || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"}
                alt={currentCat?.nickname || "Arctic Cat"}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 mb-4"
              />
              <p className="text-amber-700 italic">{getText("timer.noRecentLogs")}</p>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="bg-amber-50 border-amber-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-900">{getText("timer.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription className="text-amber-800">{getText("timer.deleteConfirmDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-amber-200 text-amber-700 hover:bg-amber-100">{getText("timer.deleteCancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">{getText("timer.deleteConfirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-full overflow-x-hidden">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 w-full max-w-full overflow-x-hidden">
        <CardHeader className="pb-3 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-xl flex items-center text-amber-900">
            <Truck className="h-5 w-5 mr-2 text-amber-700" />
            {getText("timer.recentTitle")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onAddManual} className="text-amber-700 hover:text-amber-800">
            <PlusCircle className="h-4 w-4 mr-2" />
            {getText("timer.addManual")}
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 overflow-x-hidden">
          <div className="space-y-6 w-full max-w-full overflow-x-hidden">
            {limitedDatesSorted.map(date => (
              <div key={date} className="space-y-3">
              <div className="flex justify-between items-baseline border-b border-amber-200 pb-2 gap-2 overflow-x-hidden">
                  <h3 className="text-sm font-medium text-amber-800 truncate">
                    {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="text-xs font-semibold text-amber-900 whitespace-nowrap flex-shrink-0">
                    <span className="font-normal text-amber-700">{getText("reports.logTable.total")}: </span>
                    {formatDuration(limitedEntriesByDate[date].total)}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block border border-amber-200 rounded-lg overflow-hidden w-full max-w-full">
                  <Table>
                    <TableHeader className="bg-amber-100/80">
                      <TableRow>
                        <TableHead className="w-[30%] text-amber-900">{getText("reports.logTable.route")}</TableHead>
                        <TableHead className="w-[20%] text-amber-900">{getText("reports.logTable.time")}</TableHead>
                        <TableHead className="w-[15%] text-amber-900">{getText("reports.logTable.duration")}</TableHead>
                        <TableHead className="w-[25%] text-amber-900">{getText("reports.logTable.cargo")}</TableHead>
                        <TableHead className="w-[10%] text-amber-900 text-right">{getText("timer.actions.title")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {limitedEntriesByDate[date].entries.map(entry => (
                        <TableRow key={entry.id} className="hover:bg-amber-100/50">
                          <TableCell className="font-medium text-amber-900">
                            <div className="flex items-center">
                              <div
                                className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: entry.project?.color }}
                              />
                              <span className="truncate">{entry.project?.name || "Unknown Route"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-amber-800">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</TableCell>
                          <TableCell className="font-medium text-amber-800">{formatDuration(entry.duration_minutes)}</TableCell>
                          <TableCell className="text-amber-800 text-sm italic">
                            <p className="truncate">{entry.description || "No cargo details logged."}</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(entry)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>{getText("timer.editLog.titleEdit")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onContinue(entry)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  <span>{getText("timer.actions.continue")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirmDelete(entry.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>{getText("timer.actions.delete")}</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 w-full overflow-x-hidden">
                  {limitedEntriesByDate[date].entries.map(entry => (
                    <Card key={entry.id} className="bg-white/80 border-amber-200 w-full overflow-x-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2 w-full">
                          <div className="flex items-center min-w-0 flex-1">
                            <div
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: entry.project?.color }}
                            />
                            <span className="truncate text-sm font-semibold text-amber-900">{entry.project?.name || "Unknown Route"}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                <MoreVertical className="h-4 w-4 text-amber-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(entry)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>{getText("timer.editLog.titleEdit")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onContinue(entry)}>
                                <Play className="mr-2 h-4 w-4" />
                                <span>{getText("timer.actions.continue")}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => confirmDelete(entry.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{getText("timer.actions.delete")}</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-amber-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-amber-900">{formatDuration(entry.duration_minutes)}</span>
                          <span className="text-xs text-amber-600 mx-1">•</span>
                          <span className="text-xs text-amber-700">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                        </div>
                      </CardHeader>
                      {entry.description && (
                        <CardContent className="pt-0 pb-3">
                          <p className="text-amber-800 text-xs italic bg-amber-100/50 p-2 rounded-md break-words overflow-wrap-anywhere">
                            {entry.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-amber-50 border-amber-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-amber-900">{getText("timer.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-amber-800">{getText("timer.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-amber-200 text-amber-700 hover:bg-amber-100">{getText("timer.deleteCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">{getText("timer.deleteConfirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}