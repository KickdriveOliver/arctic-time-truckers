import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Download, Upload, Calendar, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { getText } from '../components/utils/translations';
import { exportData, importData } from '@/components/utils/dataManager';
import { format } from 'date-fns';
import { getSelectedCatId } from '../components/utils/catSession';
import { localDB } from '@/components/utils/localDB';

const BACKUP_STORAGE_KEY = 'pringles_backup_settings';

export default function BackupRestore() {
  const [backupSettings, setBackupSettings] = useState({
    schedule: 'off', // off, daily, weekly, monthly
    lastBackupDate: null,
  });
  const [currentCat, setCurrentCat] = useState(null);
  const [isDue, setIsDue] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadBackupSettings();
    loadCurrentCat();
    
    const handleCatChange = () => loadCurrentCat();
    window.addEventListener("cat-session-changed", handleCatChange);
    return () => window.removeEventListener("cat-session-changed", handleCatChange);
  }, []);

  useEffect(() => {
    checkIfBackupDue();
  }, [backupSettings]);

  const loadCurrentCat = async () => {
    try {
      const selectedCatId = getSelectedCatId();
      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats?.find(cat => cat.cat_trucker_id === selectedCatId);
        setCurrentCat(selectedCat || null);
      }
    } catch (error) {
      console.error("Error loading current cat:", error);
    }
  };

  const loadBackupSettings = () => {
    try {
      const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (stored) {
        setBackupSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading backup settings:", error);
    }
  };

  const saveBackupSettings = (settings) => {
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(settings));
      setBackupSettings(settings);
    } catch (error) {
      console.error("Error saving backup settings:", error);
    }
  };

  const checkIfBackupDue = () => {
    if (backupSettings.schedule === 'off' || !backupSettings.lastBackupDate) {
      setIsDue(backupSettings.schedule !== 'off');
      return;
    }

    const lastBackup = new Date(backupSettings.lastBackupDate);
    const now = new Date();
    const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

    let due = false;
    if (backupSettings.schedule === 'daily' && daysSinceBackup >= 1) due = true;
    if (backupSettings.schedule === 'weekly' && daysSinceBackup >= 7) due = true;
    if (backupSettings.schedule === 'monthly' && daysSinceBackup >= 30) due = true;

    setIsDue(due);
  };

  const handleScheduleChange = (value) => {
    saveBackupSettings({ ...backupSettings, schedule: value });
  };

  const handleExportBackup = async (type = 'manual') => {
    try {
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
      const catName = currentCat?.nickname || 'AllCats';
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      
      // Create custom filename
      const customFilename = `PringlesTimeTrucking_Backup_${catName}_${typeLabel}_${timestamp}.json`;
      
      await exportData(customFilename);
      
      // Update last backup date
      saveBackupSettings({
        ...backupSettings,
        lastBackupDate: new Date().toISOString(),
      });
      
      setIsDue(false);
    } catch (error) {
      console.error("Error exporting backup:", error);
      alert(getText("backup.exportError") || "Backup export failed. Please try again.");
    }
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
        alert(getText("backup.importSuccess") || 'Data imported successfully! The app will now reload.');
        window.location.reload();
      } catch (e) {
        alert(`${getText("backup.importError") || "Import failed"}: ${e.message || 'Unknown error'}`);
      } finally {
        setShowImportConfirm(false);
        setFileToImport(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const getScheduleLabel = (schedule) => {
    const labels = {
      off: getText("backup.scheduleOff"),
      daily: getText("backup.scheduleDaily"),
      weekly: getText("backup.scheduleWeekly"),
      monthly: getText("backup.scheduleMonthly")
    };
    return labels[schedule] || schedule;
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json" 
        style={{ display: 'none' }} 
      />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">{getText("backup.title")}</h1>
          <p className="text-amber-700 mt-1">{getText("backup.subtitle")}</p>
        </div>

        {/* Status Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${isDue ? 'bg-amber-200' : 'bg-green-100'}`}>
                {isDue ? (
                  <AlertCircle className="h-6 w-6 text-amber-700" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-green-700" />
                )}
              </div>
              <div>
                <CardTitle className="text-amber-900">{getText("backup.statusTitle")}</CardTitle>
                <CardDescription>
                  {backupSettings.lastBackupDate ? (
                    <span>
                      {getText("backup.lastBackup")}: {format(new Date(backupSettings.lastBackupDate), 'PPP p')}
                    </span>
                  ) : (
                    <span>{getText("backup.noBackupYet")}</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {isDue && backupSettings.schedule !== 'off' && (
            <CardContent>
              <Alert className="border-amber-300 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-amber-800">
                  {getText("backup.dueReminder")}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Schedule Settings */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-700" />
              <CardTitle className="text-amber-900">{getText("backup.scheduleTitle")}</CardTitle>
            </div>
            <CardDescription>{getText("backup.scheduleDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={backupSettings.schedule} onValueChange={handleScheduleChange}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">{getText("backup.scheduleOff")}</SelectItem>
                <SelectItem value="daily">{getText("backup.scheduleDaily")}</SelectItem>
                <SelectItem value="weekly">{getText("backup.scheduleWeekly")}</SelectItem>
                <SelectItem value="monthly">{getText("backup.scheduleMonthly")}</SelectItem>
              </SelectContent>
            </Select>
            
            {backupSettings.schedule !== 'off' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-700" />
                <AlertDescription className="text-blue-800 text-sm">
                  {getText("backup.reminderExplanation")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Backup Actions */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">{getText("backup.manualTitle")}</CardTitle>
            <CardDescription>{getText("backup.manualDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => handleExportBackup(backupSettings.schedule === 'off' ? 'manual' : backupSettings.schedule)}
                className="bg-amber-600 hover:bg-amber-700 h-auto py-4"
              >
                <Download className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{getText("backup.createBackup")}</div>
                  <div className="text-xs opacity-90">{getText("backup.downloadJson")}</div>
                </div>
              </Button>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 h-auto py-4"
              >
                <Upload className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{getText("backup.restoreBackup")}</div>
                  <div className="text-xs opacity-90">{getText("backup.uploadJson")}</div>
                </div>
              </Button>
            </div>
            
            <Alert className="border-amber-300 bg-amber-50">
              <Info className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-800 text-sm">
                {getText("backup.localNote")}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Cat Wisdom */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <img 
                src={currentCat?.avatar_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"}
                alt="Pringles"
                className="w-16 h-16 rounded-full object-cover border-4 border-blue-200"
              />
              <div className="flex-1">
                <p className="text-blue-900 italic">
                  {getText("backup.catWisdom")}
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  - {currentCat?.nickname || "Pringles"}, {getText("backup.wisdomAuthor")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getText("importConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {getText("importConfirm.description").replace('%FILE%', fileToImport?.name || 'this file')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getText("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-red-600 hover:bg-red-700">
              {getText("importConfirm.action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}