import React, { useState, useEffect, useRef } from 'react';
import { localDB } from '@/components/utils/localDB';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { ChevronDown, Edit, LogOut, Trash2, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getText } from '../utils/translations';
import AvatarSelector from './AvatarSelector';
import { exportData, importData } from '@/components/utils/dataManager';

export default function CatUserSwitcher({ currentCat, onSwitchUser, onProfileUpdate }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [catToEdit, setCatToEdit] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);
  const [passcode, setPasscode] = useState('');
  
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);
  const fileInputRef = useRef(null);

  const specialtyEmoji = {
    ice_roads: "🧊",
    mountain_passes: "🏔️",
    northern_lights: "🌌",
    snow_drifts: "❄️",
    blizzard_expert: "🌪️",
  };
  
  const specialtyLabels = {
    ice_roads: getText("trucker.specialties.ice_roads"),
    mountain_passes: getText("trucker.specialties.mountain_passes"),
    northern_lights: getText("trucker.specialties.northern_lights"),
    snow_drifts: getText("trucker.specialties.snow_drifts"),
    blizzard_expert: getText("trucker.specialties.blizzard_expert")
  };

  const handleEditCat = (cat) => {
    setCatToEdit({ ...cat });
    setPasscode('');
    setShowEditDialog(true);
  };

  const handleUpdateCat = async () => {
    try {
        if (!catToEdit) return;

        let updatedData = { ...catToEdit };
        if (catToEdit.passcode_enabled && passcode) {
            if (!/^\d{4}$/.test(passcode)) {
                alert(getText('trucker.new.passHintNew'));
                return;
            }
            updatedData.passcode = passcode;
        } else if (!catToEdit.passcode_enabled) {
            updatedData.passcode = '';
        }
        
        await localDB.CatTrucker.update(catToEdit.id, updatedData);
        setShowEditDialog(false);
        if (onProfileUpdate) {
            onProfileUpdate();
        }
    } catch (error) {
        console.error("Error updating cat:", error);
    }
  };

  const handleDeleteCat = async () => {
    try {
      await localDB.CatTrucker.delete(catToDelete.id);
      // Delete associated projects and time entries
      const projects = await localDB.Project.list();
      const projectsToDelete = projects.filter(p => p.cat_trucker_id === catToDelete.cat_trucker_id);
      for (const project of projectsToDelete) {
          await localDB.Project.delete(project.id);
          const timeEntries = await localDB.TimeEntry.list();
          const entriesToDelete = timeEntries.filter(t => t.project_id === project.project_id);
          for (const entry of entriesToDelete) {
              await localDB.TimeEntry.delete(entry.id);
          }
      }
      setShowDeleteDialog(false);
      onSwitchUser(); // Go back to welcome screen
    } catch (error) {
      console.error("Error deleting cat and their data:", error);
    }
  };

  const confirmDelete = (cat) => {
    setCatToDelete(cat);
    setShowDeleteDialog(true);
  };
  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileToImport(file);
      setShowImportConfirm(true);
    }
  };

  const confirmImport = async () => {
    if (fileToImport) {
      try {
        await importData(fileToImport);
        alert('Data imported successfully! The app will now reload.');
        window.location.reload(); // Reload to reflect imported data everywhere
      } catch (e) {
        alert(`Import failed: ${e.message || 'Unknown error'}`);
      } finally {
        setShowImportConfirm(false);
        setFileToImport(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" style={{ display: 'none' }} />
      {currentCat ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between items-center text-left h-auto py-2 px-3 hover:bg-amber-800/50">
              <div className="flex items-center gap-3 min-w-0">
                <img src={currentCat.avatar_url} alt={currentCat.nickname} className="w-10 h-10 rounded-full object-cover border-2 border-amber-300/30" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-amber-50">{currentCat.nickname}</p>
                  <p className="text-xs text-amber-300 truncate">
                    {specialtyEmoji[currentCat.specialty] || '🐾'} {getText(`trucker.specialties.${currentCat.specialty}`) || currentCat.specialty?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-amber-300 ml-1 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{currentCat.nickname}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEditCat(currentCat)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>{getText("trucker.menu.editProfile")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => confirmDelete(currentCat)} className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{getText("trucker.menu.deleteTrucker")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSwitchUser}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{getText("trucker.menu.switchCat")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          variant="ghost" 
          className="w-full justify-between items-center text-left h-auto py-2 px-3 hover:bg-amber-800/50 group"
          onClick={onSwitchUser}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-amber-800/50 flex items-center justify-center border-2 border-dashed border-amber-300/30 group-hover:border-amber-300/70 transition-colors">
              <span className="text-lg">🐱</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-amber-50">Select Trucking Cat</p>
              <p className="text-xs text-amber-300 truncate">{getText("app.shortName")}</p>
            </div>
          </div>
        </Button>
      )}

      {showEditDialog && catToEdit && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{getText("trucker.edit.title").replace("%CAT%", catToEdit.nickname)}</DialogTitle>
              <DialogDescription>{getText("trucker.edit.description").replace("%CAT%", catToEdit.nickname)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <AvatarSelector
                currentAvatar={catToEdit.avatar_url}
                onSelect={(url) => setCatToEdit({ ...catToEdit, avatar_url: url })}
              />
              <div>
                <Label htmlFor="nickname-edit">{getText("trucker.edit.nickname")}</Label>
                <Input
                  id="nickname-edit"
                  value={catToEdit.nickname}
                  onChange={(e) => setCatToEdit({ ...catToEdit, nickname: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="name-edit">{getText("trucker.edit.fullName")}</Label>
                <Input
                  id="name-edit"
                  value={catToEdit.name}
                  onChange={(e) => setCatToEdit({ ...catToEdit, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="specialty-edit">{getText("trucker.edit.specialty")}</Label>
                <Select value={catToEdit.specialty} onValueChange={value => setCatToEdit({...catToEdit, specialty: value})}>
                     <SelectTrigger>
                         <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                         {Object.entries(specialtyLabels).map(([value, label]) => (
                             <SelectItem key={value} value={value}>{label}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
              </div>
              <div>
                <Label htmlFor="years-edit">{getText("trucker.edit.years")}</Label>
                <Input
                  id="years-edit"
                  type="number"
                  min="0"
                  value={catToEdit.years_of_service}
                  onChange={(e) => setCatToEdit({ ...catToEdit, years_of_service: Number(e.target.value || 0)})}
                />
              </div>
              <div>
                <Label htmlFor="fav-route-edit">Favorite Route</Label>
                <Input
                  id="fav-route-edit"
                  value={catToEdit.favorite_route}
                  onChange={(e) => setCatToEdit({ ...catToEdit, favorite_route: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="passcode-enabled-edit"
                  checked={catToEdit.passcode_enabled}
                  onCheckedChange={(checked) => setCatToEdit({ ...catToEdit, passcode_enabled: checked, passcode: '' })}
                />
                <Label htmlFor="passcode-enabled-edit">{getText("trucker.edit.passEnable")}</Label>
              </div>
              {catToEdit.passcode_enabled && (
                 <div>
                    <Label htmlFor="passcode-edit">{getText("trucker.edit.passLabel")}</Label>
                    <Input
                      id="passcode-edit"
                      type="password"
                      maxLength="4"
                      placeholder={getText("trucker.edit.passHintKeep")}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                    />
                  </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>{getText("common.cancel")}</Button>
              <Button onClick={handleUpdateCat}>{getText("common.saveChanges")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showDeleteDialog && catToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{getText("trucker.delete.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {getText("trucker.delete.bodyTitle").replace('%CAT%', catToDelete.nickname)}
                        <br />
                        {getText("trucker.delete.bodyText")}
                        <br />
                        <strong className="text-red-500">{getText("trucker.delete.warning")}</strong>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{getText("trucker.delete.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCat} className="bg-red-600 hover:bg-red-700">{getText("trucker.delete.confirm")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getText("importConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {getText("importConfirm.description").replace('%FILE%', fileToImport?.name || 'this file')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-red-600 hover:bg-red-700">{getText("importConfirm.action")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}