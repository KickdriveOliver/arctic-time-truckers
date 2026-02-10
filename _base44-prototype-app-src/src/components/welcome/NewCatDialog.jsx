import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getText } from '../utils/translations';
import AvatarSelector from "../users/AvatarSelector";

export default function NewCatDialog({ onClose, onCreate }) {
    const [catData, setCatData] = useState({
        name: "",
        nickname: "",
        specialty: "ice_roads",
        avatar_url:
          "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg",
        years_of_service: 0,
        favorite_route: "",
        passcode_enabled: false,
        passcode: "",
        cat_trucker_id: `cat_${Date.now()}`
    });
    const [submitting, setSubmitting] = useState(false);

    const specialtyLabels = {
        ice_roads: getText("trucker.specialties.ice_roads"),
        mountain_passes: getText("trucker.specialties.mountain_passes"),
        northern_lights: getText("trucker.specialties.northern_lights"),
        snow_drifts: getText("trucker.specialties.snow_drifts"),
        blizzard_expert: getText("trucker.specialties.blizzard_expert")
    };
    
    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        // basic validation
        if (!catData.nickname?.trim() || !catData.name?.trim()) {
            alert("Please fill in Full Name and Nickname.");
            return;
        }
        if (catData.passcode_enabled && !/^\d{4}$/.test(catData.passcode || "")) {
            alert("Please enter a 4-digit paw-code.");
            return;
        }
        try {
            setSubmitting(true);
            const payload = { 
              ...catData, 
              cat_trucker_id: catData.cat_trucker_id || `cat_${Date.now()}`
            };
            if (!payload.passcode_enabled) payload.passcode = "";
            if (typeof onCreate === "function") {
              await onCreate(payload);
              onClose && onClose();
            } else {
              alert("Could not create trucker: action not available.");
            }
        } catch (err) {
            console.error("Error creating new cat:", err);
            alert("Creating the new trucker failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{getText("trucker.new.title")}</DialogTitle>
                    <DialogDescription>{getText("trucker.new.description")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <AvatarSelector
                      currentAvatar={catData.avatar_url}
                      onSelect={(url) => setCatData({ ...catData, avatar_url: url })}
                    />

                    <div>
                        <Label htmlFor="nickname">{getText("trucker.new.nickname")}</Label>
                        <Input id="nickname" value={catData.nickname} onChange={e => setCatData({...catData, nickname: e.target.value})} required />
                    </div>
                     <div>
                        <Label htmlFor="name">{getText("trucker.new.fullName")}</Label>
                        <Input id="name" value={catData.name} onChange={e => setCatData({...catData, name: e.target.value})} required />
                    </div>
                    <div>
                        <Label htmlFor="years">{getText("trucker.new.years")}</Label>
                        <Input id="years" type="number" min="0" value={catData.years_of_service}
                               onChange={e => setCatData({...catData, years_of_service: Number(e.target.value || 0)})} />
                    </div>
                    <div>
                        <Label htmlFor="fav">{getText("trucker.new.favoriteRoute")}</Label>
                        <Input id="fav" value={catData.favorite_route}
                               onChange={e => setCatData({...catData, favorite_route: e.target.value})} />
                    </div>
                    <div>
                        <Label htmlFor="specialty">{getText("trucker.new.specialty")}</Label>
                         <Select value={catData.specialty} onValueChange={value => setCatData({...catData, specialty: value})}>
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
                    <div className="flex items-center space-x-2">
                        <Switch
                          id="passcode-enabled"
                          checked={catData.passcode_enabled}
                          onCheckedChange={(checked) => setCatData({ ...catData, passcode_enabled: checked, passcode: '' })}
                        />
                        <Label htmlFor="passcode-enabled">{getText("trucker.new.passEnable")}</Label>
                    </div>
                    {catData.passcode_enabled && (
                        <div>
                            <Label htmlFor="passcode">{getText("trucker.new.passLabel")}</Label>
                            <Input
                              id="passcode"
                              type="password"
                              maxLength="4"
                              placeholder={getText("trucker.new.passHint")}
                              value={catData.passcode}
                              onChange={(e) => setCatData({ ...catData, passcode: e.target.value })}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                      {getText("common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {submitting ? "Adding..." : getText("trucker.new.addButton")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}