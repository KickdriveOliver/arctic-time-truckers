
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Truck, Clock, BarChart3, Folder, Menu, X, Snowflake, BookOpen, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { getText, initLanguage, getLanguage } from "./components/utils/translations";
import LanguageSelector from "./components/LanguageSelector";
import CatUserSwitcher from "./components/users/CatUserSwitcher";
import WelcomeScreen from "./components/welcome/WelcomeScreen";
import { localDB } from '@/components/utils/localDB';
import { getSelectedCatId, setSelectedCatId, clearSelectedCat } from "./components/utils/catSession";

const IconCat = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.25 21.75c-.69 0-1.38-.2-2-.55-1.38-.7-2.31-2.22-2.31-4.2V15.5c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5v1.5c0 1.98-.93 3.5-2.31 4.2-.62.35-1.31.55-2 .55z" />
    <path d="M12.25 11a5.5 5.5 0 00-5.41 4.5H5.75a4 4 0 01-4-4V8.5a4 4 0 014-4h.29a.25.25 0 01.24.31l-.47 2.03a.25.25 0 00.3.28l1.75-.6a.25.25 0 01.3.03l1.24 1.25a.25.25 0 00.35 0l1.25-1.25a.25.25 0 01.3-.03l1.75.6a.25.25 0 00.3-.28l-.47-2.03a.25.25 0 01.24-.31h.29a4 4 0 014 4v3a4 4 0 01-4 4h-1.09a5.5 5.5 0 00-5.41-4.5z" />
  </svg>
);

const BACKUP_STORAGE_KEY = 'pringles_backup_settings';

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [_, setLang] = useState(getLanguage());
  const [selectedTrucker, setSelectedTrucker] = useState(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupDue, setIsBackupDue] = useState(false);

  // Check if backup is due
  const checkBackupStatus = () => {
    try {
      const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (!stored) return false;
      
      const settings = JSON.parse(stored);
      if (settings.schedule === 'off' || !settings.lastBackupDate) {
        return settings.schedule !== 'off';
      }

      const lastBackup = new Date(settings.lastBackupDate);
      const now = new Date();
      const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

      if (settings.schedule === 'daily' && daysSinceBackup >= 1) return true;
      if (settings.schedule === 'weekly' && daysSinceBackup >= 7) return true;
      if (settings.schedule === 'monthly' && daysSinceBackup >= 30) return true;
      
      return false;
    } catch (error) {
      console.error('Error checking backup status:', error);
      return false;
    }
  };

  useEffect(() => {
    initLanguage();
    const handleLanguageChange = () => setLang(getLanguage());
    window.addEventListener("language-changed", handleLanguageChange);
    
    const handleCatSessionChange = () => {
      checkForSelectedTrucker();
    };
    window.addEventListener("cat-session-changed", handleCatSessionChange);

    checkForSelectedTrucker();

    // Check backup status initially and set up interval
    setIsBackupDue(checkBackupStatus());
    const backupCheckInterval = setInterval(() => {
      setIsBackupDue(checkBackupStatus());
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener("language-changed", handleLanguageChange);
      window.removeEventListener("cat-session-changed", handleCatSessionChange);
      clearInterval(backupCheckInterval);
    };
  }, []);

  const checkForSelectedTrucker = async () => {
    try {
      setIsLoading(true);
      const selectedCatId = getSelectedCatId();

      if (selectedCatId) {
        const cats = await localDB.CatTrucker.list();
        const selectedCat = cats && cats.find(cat => cat.cat_trucker_id === selectedCatId);

        if (selectedCat) {
          setSelectedTrucker(selectedCat);
          setShowWelcomeScreen(false);
        } else {
          clearSelectedCat();
          setShowWelcomeScreen(true);
        }
      } else {
        const allCats = await localDB.CatTrucker.list();
        if (allCats.length === 0) {
            setShowWelcomeScreen(true);
        } else {
            setShowWelcomeScreen(true);
            setSelectedTrucker(null);
        }
      }
    } catch (error) {
      console.error("Error checking for selected trucker:", error);
      setShowWelcomeScreen(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTruckerSelected = (trucker) => {
    if (trucker && trucker.cat_trucker_id) {
      setSelectedCatId(trucker.cat_trucker_id); 
    }
    setSelectedTrucker(trucker || null);
    setShowWelcomeScreen(false);
  };

  const handleShowTruckerSelection = () => {
    clearSelectedCat();
    setSelectedTrucker(null);
    setShowWelcomeScreen(true);
    // Force navigation to a non-legal page (e.g., Dashboard or root) to ensure the WelcomeScreen is shown
    // if the user is currently on a "legal" page like Guide, Imprint, etc.
    if (isLegalPage) {
        navigate(createPageUrl("Dashboard"));
    }
  };
  
  const isActive = (pageName) => {
    return currentPageName === pageName;
  };
  
  const navigation = [
    { name: getText("navigation.dashboard"), href: createPageUrl("Dashboard"), icon: Snowflake, pageName: "Dashboard" },
    { name: getText("navigation.timer"), href: createPageUrl("Timer"), icon: Clock, pageName: "Timer" },
    { name: getText("navigation.projects"), href: createPageUrl("Projects"), icon: Folder, pageName: "Projects" },
    { name: getText("navigation.reports"), href: createPageUrl("Reports"), icon: BarChart3, pageName: "Reports" },
    { name: getText("navigation.backup"), href: createPageUrl("BackupRestore"), icon: Download, pageName: "BackupRestore", showBadge: isBackupDue },
    { name: getText("navigation.guide"), href: createPageUrl("Guide"), icon: BookOpen, pageName: "Guide" }
  ];

  const isLegalPage = currentPageName === "Imprint" || currentPageName === "PrivacyPolicy" || currentPageName === "Guide";

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-amber-50 text-amber-800">Loading...</div>;
  }

  if (showWelcomeScreen && !isLegalPage) {
    return <WelcomeScreen onSelectTrucker={handleTruckerSelected} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 flex flex-col">
      <div className="flex flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div
          className={cn(
            "fixed top-0 left-0 h-full bg-gradient-to-b from-amber-800 to-amber-900 text-white w-64 p-4 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-bold text-amber-200">{getText("app.shortName")}</h1>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button
                className="md:hidden text-amber-300 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-[calc(100%-4rem)]">
            <div className="px-4 pt-4 pb-2 text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                 <img
                    src={(selectedTrucker && selectedTrucker.avatar_url) || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg"}
                    alt="Current Cat Trucker"
                    className="w-full h-full object-cover rounded-full border-4 border-amber-400 shadow-lg"
                  />
              </div>
              <p className="text-xs text-amber-300 italic bg-black/20 rounded-md px-2 py-1">
                "{getText("quote")}"
              </p>
              <p className="text-xs text-amber-400 mt-1">- {getText("quoteAuthor")}</p>
            </div>

            <nav className="flex-1 px-4 mt-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md",
                    isActive(item.pageName)
                      ? "bg-amber-900 text-white"
                      : "text-amber-300 hover:bg-amber-700 hover:text-white"
                  )}
                   onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.showBadge && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Backup reminder due" />
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-auto px-2 pb-2">
                <CatUserSwitcher 
                    currentCat={selectedTrucker}
                    onSwitchUser={handleShowTruckerSelection} 
                    onProfileUpdate={() => checkForSelectedTrucker()}
                />
            </div>
          </div>
        </div>

        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 flex items-center justify-between p-1.5 bg-white/50 backdrop-blur-sm border-b border-gray-200 md:hidden">
             <button
              className="p-2 text-gray-500 rounded-md"
              onClick={() => setSidebarOpen(true)}
             >
              <Menu className="h-6 w-6" />
             </button>
          </div>

          <main className="relative z-10 py-6 px-4 sm:px-6 md:px-8 flex-1 overflow-x-hidden">
            <div className="max-w-7xl mx-auto min-w-0 w-full">
               <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 border border-amber-100 overflow-x-hidden">
                {children}
              </div>
            </div>
          </main>

          <footer className="relative z-10 p-4 text-center text-xs text-amber-700">
            <div className="max-w-7xl mx-auto flex justify-center items-center gap-4">
              <Link to={createPageUrl("Imprint")} className="hover:underline">{getText("legal.imprint")}</Link>
              <span>|</span>
              <Link to={createPageUrl("PrivacyPolicy")} className="hover:underline">{getText("legal.privacy")}</Link>
            </div>
            <p className="mt-2 opacity-70">© {new Date().getFullYear()} {getText("app.name")} {getText("legal.rights")}</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
