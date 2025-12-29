import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, parse, setHours, setMinutes, setSeconds, differenceInMinutes, subDays, addHours } from 'date-fns';
import { getText } from '../utils/translations';
import { formatDuration } from '../utils/timeUtils';

export default function EditTimeEntryDialog({ isOpen, onClose, entry, projects, onSave }) {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (entry) {
      // Editing existing entry
      const entryDate = new Date(entry.start_time);
      setDate(entryDate);
      setStartTime(format(entryDate, 'HH:mm'));
      setEndTime(format(new Date(entry.end_time), 'HH:mm'));
      setProjectId(entry.project_id);
      setDescription(entry.description || '');
    } else {
      // New entry: default to yesterday at current time + 1 hour
      const now = new Date();
      const yesterday = subDays(now, 1);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Create start time with current hour and minute
      const startDateTime = setMinutes(setHours(now, currentHour), currentMinute);
      // Create end time by adding 1 hour to start time
      const endDateTime = addHours(startDateTime, 1);
      
      setDate(yesterday);
      setStartTime(format(startDateTime, 'HH:mm'));
      setEndTime(format(endDateTime, 'HH:mm'));
      setProjectId('');
      setDescription('');
    }
  }, [entry, isOpen]);

  const handleSave = () => {
    if (!projectId) {
      return;
    }
    
    const [startH, startM] = startTime.split(':').map(Number);
    const startDateTime = setSeconds(setMinutes(setHours(date, startH), startM), 0);

    const [endH, endM] = endTime.split(':').map(Number);
    let endDateTime = setSeconds(setMinutes(setHours(date, endH), endM), 0);

    if (endDateTime <= startDateTime) {
      endDateTime = new Date(endDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    const duration = differenceInMinutes(endDateTime, startDateTime);

    const payload = {
      id: entry ? entry.id : null,
      project_id: projectId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: duration,
      description: description,
      date: format(date, 'yyyy-MM-dd')
    };

    onSave(payload);
  };
  
  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const startDateTime = setMinutes(setHours(date, startH), startM);
    const [endH, endM] = endTime.split(':').map(Number);
    let endDateTime = setMinutes(setHours(date, endH), endM);
    if(endDateTime <= startDateTime) {
      endDateTime = new Date(endDateTime); 
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    return differenceInMinutes(endDateTime, startDateTime);
  }

  if (!isOpen) return null;

  const title = entry && entry.id ? getText('timer.editLog.titleEdit') : getText('timer.editLog.titleAdd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-amber-50 border-amber-200">
        <DialogHeader>
          <DialogTitle className="text-amber-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="project" className="text-amber-900">{getText('timer.editLog.route')}</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="project" className="border-amber-200 bg-white">
                <SelectValue placeholder={getText('timer.editLog.selectRoutePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border-amber-200">
                {projects.map(p => (
                  <SelectItem key={p.project_id} value={p.project_id} className="text-amber-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-amber-900">{getText('timer.editLog.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="justify-start text-left font-normal border-amber-200 bg-white"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>{getText('common.pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="duration" className="text-amber-900">{getText('timer.editLog.duration')}</Label>
                <div id="duration" className="flex items-center justify-center h-10 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm">
                    {formatDuration(calculateDuration())}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time" className="text-amber-900">{getText('timer.editLog.startTime')}</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="border-amber-200 bg-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time" className="text-amber-900">{getText('timer.editLog.endTime')}</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="border-amber-200 bg-white"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-amber-900">{getText('timer.editLog.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={getText('timer.editLog.descriptionPlaceholder')}
              className="border-amber-200 bg-amber-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-amber-700 hover:bg-amber-100">{getText('common.cancel')}</Button>
          <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">{getText('timer.editLog.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}