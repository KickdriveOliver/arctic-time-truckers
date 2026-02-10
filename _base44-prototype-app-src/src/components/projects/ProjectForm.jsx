import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { localDB } from "@/components/utils/localDB";
import { getSelectedCatId } from "@/components/utils/catSession";
import { getText } from "@/components/utils/translations";

export default function ProjectForm({ project = null, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [color, setColor] = useState(project?.color || "#f59e0b");
  const [currentCat, setCurrentCat] = useState(null);
  
  useEffect(() => {
    const loadCurrentCat = async () => {
      try {
        const selectedId = getSelectedCatId();
        if (!selectedId) {
          setCurrentCat(null);
          return;
        }
        const cats = await localDB.CatTrucker.list();
        const cat = cats.find(c => c.cat_trucker_id === selectedId) || null;
        setCurrentCat(cat);
      } catch (error) {
        console.error("Error loading current cat in ProjectForm:", error);
        setCurrentCat(null);
      }
    };
    loadCurrentCat();
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") {
      onSave({ name, description, color });
    } else {
      console.warn("onSave is not a function");
    }
  };

  // Pringles-approved colors
  const colors = [
    "#f59e0b", // amber (Pringles' fur)
    "#ea580c", // orange (sunset on the arctic)
    "#dc2626", // red (truck lights)
    "#2563eb", // blue (ice road)
    "#059669", // emerald (northern lights)
    "#7c3aed", // violet (arctic twilight)
    "#c026d3", // fuchsia (arctic flowers)
    "#475569", // slate (truck grille)
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-amber-900">{getText("projects.projectName")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={currentCat ? getText("projects.placeholders.name").replace('%CAT%', currentCat.nickname) : getText("projects.placeholders.nameGeneric")}
          className="border-amber-200 bg-amber-50 text-amber-900 placeholder:text-amber-400"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-amber-900">{getText("projects.projectDescription")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={getText("projects.placeholders.description")}
          className="border-amber-200 bg-amber-50 text-amber-900 placeholder:text-amber-400"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-amber-900">{getText("projects.color")}</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-amber-600' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" className="border-amber-200 text-amber-800" onClick={onCancel}>
            {getText("common.cancel")}
          </Button>
        )}
        {project && onDelete && (
          <Button
            type="button"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={onDelete}
          >
            {getText("projects.deleteProject")}
          </Button>
        )}
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
          {project ? getText("projects.updateProject") : getText("projects.createProject")}
        </Button>
      </div>
    </form>
  );
}