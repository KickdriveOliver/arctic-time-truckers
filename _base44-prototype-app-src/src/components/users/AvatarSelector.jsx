import React from 'react';
import { Button } from "@/components/ui/button";
import { getText } from "../utils/translations";

// 🎯 EDIT THIS ARRAY TO CHANGE AVATAR OPTIONS
const AVATAR_OPTIONS = [
  {
    id: 'pringles_original',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4c3636_pringes_at_trucking.jpeg',
    name: 'Pringles Classic',
    description: 'The original grumpy trucker'
  },
  {
    id: 'aurora_truck',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/680fc11cf00ff52d15b7d900/75abe1cbe_aurora_truck.jpg',
    name: 'Aurora Trucker',
    description: 'Professional arctic driver with cozy winter gear'
  },
  {
    id: 'orange_trucker',
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&crop=face',
    name: 'Orange Tabby Trucker',
    description: 'A cheerful orange cat ready for the road'
  },
  {
    id: 'gray_professional',
    url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=200&h=200&fit=crop&crop=face',
    name: 'Gray Professional',
    description: 'Sophisticated and experienced'
  },
  {
    id: 'black_white_expert',
    url: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=200&h=200&fit=crop&crop=face',
    name: 'Tuxedo Expert',
    description: 'Formal and ready for business'
  },
  {
    id: 'fluffy_specialist',
    url: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=200&h=200&fit=crop&crop=face',
    name: 'Fluffy Specialist',
    description: 'Extra fluffy for arctic conditions'
  },
  {
    id: 'brown_veteran',
    url: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&h=200&fit=crop&crop=face',
    name: 'Brown Veteran',
    description: 'Years of trucking experience'
  }
];

// Accept both old and new prop names to be backward compatible with existing usages.
export default function AvatarSelector({
  selectedAvatarUrl,
  onAvatarSelect,
  className = "",
  currentAvatar,       // legacy prop name used by CatUserSwitcher
  onSelect             // legacy callback prop name
}) {
  const activeUrl = selectedAvatarUrl ?? currentAvatar ?? AVATAR_OPTIONS[0].url;
  const handleSelect = onAvatarSelect || onSelect || (() => {});
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-amber-300 mb-4">
          <img
            src={activeUrl}
            alt="Selected avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-amber-700">{getText("trucker.edit.choosePhoto")}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {AVATAR_OPTIONS.map((avatar) => (
          <Button
            key={avatar.id}
            type="button"
            variant={activeUrl === avatar.url ? "default" : "outline"}
            className={`p-2 h-auto flex flex-col items-center gap-1 ${
              activeUrl === avatar.url 
                ? 'border-amber-600 bg-amber-100' 
                : 'border-amber-200 hover:border-amber-400'
            }`}
            onClick={() => handleSelect(avatar.url)}
            title={avatar.description}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-200">
              <img
                src={avatar.url}
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-center text-amber-800 leading-tight">
              {avatar.name}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}