import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Save, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { formatTimeDisplay } from "../utils/timeUtils";

export default function TimerControls({ 
  isRunning, 
  elapsedTime,
  description, 
  setDescription,
  handleStart, 
  handlePause, 
  handleSave,
  currentCat,
  getTimerText, // This function is passed from Timer.js and handles %CAT% replacement
  adjustTime
}) {
  const { hours, minutes, seconds } = formatTimeDisplay(elapsedTime);
  
  // Function to handle time adjustment
  const handleTimeAdjustment = (direction) => {
    // 15 minutes in ms
    const adjustmentAmount = 15 * 60 * 1000;

    if (direction === 'increase') {
      // pass delta +15m
      adjustTime(adjustmentAmount);
    } else if (direction === 'decrease') {
      // pass delta -15m (Timer clamps to >= 0)
      adjustTime(-adjustmentAmount);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4 sm:p-6 border rounded-xl bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-200 shadow-lg w-full max-w-full overflow-x-hidden">
		        {/* Big Timer Display */}
      <div className="text-center w-full overflow-x-hidden">
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-center">
          <img 
            src={currentCat?.avatar_url || "https://placekitten.com/200/200"}
            alt={currentCat?.nickname || "Ready to drive"}
            className="w-28 h-28 rounded-full object-cover border-4 border-amber-200 mb-4" 
          />
        </div>
        
        {/* Time display with adjustment buttons */}
        <div className="flex flex-col items-center gap-3 w-full overflow-x-hidden">
          <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-amber-900 leading-tight">
            {hours.toString().padStart(2, '0')}
            <span className="text-amber-700">:</span>
            {minutes.toString().padStart(2, '0')}
            <span className="text-amber-700">:</span>
            {seconds.toString().padStart(2, '0')}
          </div>
          
          {/* Time adjustment controls - shown below on mobile, side on desktop */}
          {!isRunning && elapsedTime > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                onClick={() => handleTimeAdjustment('decrease')}
                size="sm"
                variant="ghost"
                className="h-8 px-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                <span className="text-xs">15 min</span>
              </Button>
              <span className="text-xs text-amber-600">Adjust time</span>
              <Button
                onClick={() => handleTimeAdjustment('increase')}
                size="sm"
                variant="ghost"
                className="h-8 px-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                <span className="text-xs">15 min</span>
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-amber-600 break-words px-2">
          {isRunning ? 
            `${currentCat?.nickname || "Cat"} is hauling cargo! 🚛` : 
            elapsedTime > 0 ? 
              `${currentCat?.nickname || "Cat"} is taking a cat nap` : 
              "Ready to hit the icy roads?"}
        </div>
      </div>

      {/* Main Action Button */}
      {!isRunning ? (
        <Button 
          onClick={handleStart} 
          className="w-full py-6 sm:py-8 bg-green-600 hover:bg-green-700 text-base sm:text-lg font-semibold"
        >
          <Play className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          <span className="truncate">{elapsedTime > 0 ? "Continue Arctic Trucking" : "Start Arctic Expedition"}</span>
        </Button>
      ) : (
        <Button 
          onClick={handlePause} 
          className="w-full py-6 sm:py-8 bg-amber-600 hover:bg-amber-700 text-base sm:text-lg font-semibold"
        >
          <Pause className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          <span className="truncate">Take a Catnap</span>
        </Button>
      )}

      {/* Description Input - only show when timer is paused and has time */}
      {!isRunning && elapsedTime > 0 && (
        <div className="space-y-4 p-4 bg-amber-100 rounded-lg w-full overflow-x-hidden">
          <h3 className="font-medium text-amber-900">Finished this cargo haul?</h3>
          <Input
            placeholder={getTimerText("whatHauling")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-amber-200 bg-white text-amber-900 placeholder:text-amber-400 w-full"
          />
          <Button 
            onClick={handleSave} 
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            <Save className="mr-2 h-5 w-5 flex-shrink-0" />
            <span className="truncate">Log Completed Delivery</span>
          </Button>
          <p className="text-xs text-amber-700 italic text-center break-words">
            This will log the expedition and reset the paw-meter
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-amber-700 space-y-2 bg-amber-100/50 p-4 rounded-lg w-full overflow-x-hidden">
        <h4 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{getTimerText("instructionsTitle")}</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1 break-words">
          <li>{getTimerText("instruction1")}</li>
          <li>{getTimerText("instruction2")}</li>
          <li>{getTimerText("instruction3")}</li>
          <li>{getTimerText("instruction4")}</li>
          <li>{getTimerText("instruction5")}</li>
        </ol>
      </div>
    </div>
  );
}