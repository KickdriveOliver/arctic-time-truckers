import React, { useState, useEffect, useRef } from 'react';
import { localDB } from '@/components/utils/localDB';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PasscodeDialog from '../users/PasscodeDialog';
import { setSelectedCatId } from '../utils/catSession';
import NewCatDialog from './NewCatDialog';
import { getText } from '../utils/translations';
import { Plus } from 'lucide-react';


export default function WelcomeScreen({ onSelectTrucker }) {
  const [cats, setCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [showNewCatDialog, setShowNewCatDialog] = useState(false);
  
  useEffect(() => {
    loadCats();
    window.addEventListener('cat-session-changed', loadCats);
    return () => window.removeEventListener('cat-session-changed', loadCats);
  }, []);

  const loadCats = async () => {
    try {
      const allCats = await localDB.CatTrucker.list();
      setCats(allCats);
    } catch (error) {
      console.error("Error loading cat truckers:", error);
    }
  };

  const handleCatSelect = (cat) => {
    if (cat.passcode_enabled) {
      setSelectedCat(cat);
      setShowPasscodeDialog(true);
    } else {
      onSelectTrucker(cat);
    }
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeDialog(false);
    onSelectTrucker(selectedCat);
  };
  
  const handleCreateNewCat = async (newCatData) => {
    try {
      const newCat = await localDB.CatTrucker.create(newCatData);
      setShowNewCatDialog(false);
      onSelectTrucker(newCat);
    } catch (error) {
      console.error("Error creating new cat:", error);
      alert("Could not add the new trucker. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg" alt="Pringles Trucking" className="w-40 h-40 mx-auto rounded-full object-cover border-8 border-white shadow-2xl mb-6" />
          <h1 className="text-4xl font-bold text-amber-900 mb-2">{getText("welcome.title")}</h1>
          <p className="text-amber-700 text-lg mb-4">{getText("welcome.subtitle")}</p>

          <div className="mb-8">
            <Link to={createPageUrl("Guide")} className="inline-flex items-center justify-center px-4 py-2 bg-white/50 hover:bg-white/80 text-amber-800 border border-amber-200 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow group">
              <span className="group-hover:scale-110 transition-transform mr-2">📘</span>
              {getText("welcome.guideLink")}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {cats.map(cat => (
              <div key={cat.id} onClick={() => handleCatSelect(cat)} className="cursor-pointer group">
                <div className="p-4 bg-white/70 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-100 flex flex-col items-center">
                  <img src={cat.avatar_url} alt={cat.nickname} className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 group-hover:border-amber-400 transition-colors" />
                  <h3 className="mt-4 text-lg font-semibold text-amber-900">{cat.nickname}</h3>
                  <p className="text-sm text-amber-600">{cat.specialty.replace(/_/g, ' ')}</p>
                </div>
              </div>
            ))}
            <div onClick={() => setShowNewCatDialog(true)} className="cursor-pointer group">
                <div className="p-4 bg-transparent rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-dashed border-amber-300 hover:border-amber-500 flex flex-col items-center justify-center h-full">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-300 group-hover:border-amber-500 flex items-center justify-center">
                        <Plus className="text-5xl text-amber-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  <h3 className="mt-4 text-lg font-semibold text-amber-600">{getText("welcome.addTrucker")}</h3>
                </div>
            </div>
          </div>
          
          <div className="max-w-xl mx-auto text-xs text-amber-600 mb-8">
            {getText("welcome.consent.intro")}{' '}
            <Link to={createPageUrl("PrivacyPolicy")} className="underline hover:text-amber-800">{getText("welcome.consent.privacy")}</Link>
            {' & '}
            <Link to={createPageUrl("Imprint")} className="underline hover:text-amber-800">{getText("welcome.consent.imprint")}</Link>.
          </div>

        </div>
      </div>
      
      {showPasscodeDialog && (
        <PasscodeDialog
          cat={selectedCat}
          onSuccess={handlePasscodeSuccess}
          onClose={() => setShowPasscodeDialog(false)}
        />
      )}
      
      {showNewCatDialog && (
        <NewCatDialog 
            onClose={() => setShowNewCatDialog(false)}
            onCreate={handleCreateNewCat}
        />
      )}
    </>
  );
}