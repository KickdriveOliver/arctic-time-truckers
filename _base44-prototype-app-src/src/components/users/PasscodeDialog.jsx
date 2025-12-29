import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getText } from "../utils/translations";

export default function PasscodeDialog({
  isOpen,
  onClose,
  onSuccess,
  catTrucker,
  cat, // alternate prop name used by some screens
}) {
  const catData = catTrucker || cat || null;

  // If isOpen is provided, respect it; otherwise auto-open when catData exists
  const dialogOpen = typeof isOpen === "boolean" ? isOpen : !!catData;

  const [passcode, setPasscode] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (dialogOpen) {
      setPasscode(["", "", "", ""]);
      setError(false);
      setTimeout(() => inputRefs[0].current?.focus(), 80);
    }
  }, [dialogOpen]);

  const handleSubmit = (code) => {
    if (!catData) return;
    const expected = String(catData.passcode || "");
    if (code === expected) {
      onSuccess && onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setPasscode(["", "", "", ""]);
      setTimeout(() => inputRefs[0].current?.focus(), 80);
    }
  };

  const handleInputChange = (index, value) => {
    // paste of full code
    if (value.length > 1) {
      if (/^\d{4}$/.test(value)) {
        const arr = value.split("");
        setPasscode(arr);
        handleSubmit(value);
      }
      return;
    }
    // single char
    if (value !== "" && !/^\d$/.test(value)) return;
    const next = [...passcode];
    next[index] = value;
    setPasscode(next);
    if (value !== "" && index < 3) inputRefs[index + 1].current?.focus();
    if (value !== "" && index === 3 && next.every((d) => d !== "")) {
      handleSubmit(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (passcode[index] !== "") {
        const next = [...passcode];
        next[index] = "";
        setPasscode(next);
      } else if (index > 0) {
        const next = [...passcode];
        next[index - 1] = "";
        setPasscode(next);
        inputRefs[index - 1].current?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs[index - 1].current?.focus();
    if (e.key === "ArrowRight" && index < 3) inputRefs[index + 1].current?.focus();
  };

  if (!catData) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 max-w-xs sm:max-w-sm">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-amber-300">
              <img
                src={catData?.avatar_url}
                alt={catData?.nickname || "Cat"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <DialogTitle className="text-center text-amber-900">
            {getText("trucker.passcode.dialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-center text-amber-700">
            <span className="block">
              {catData?.nickname 
                ? getText("trucker.passcode.enterCode").replace('%CAT%', catData.nickname)
                : getText("trucker.passcode.enterCodeGeneric")
              }
            </span>
            {error && (
              <span className="block text-red-600 font-medium mt-1">
                {getText("trucker.passcode.error")}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className={`mt-4 ${shake ? "animate-wiggle" : ""}`}>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <Input
                  ref={inputRefs[i]}
                  type="text"
                  inputMode="numeric"
                  value={passcode[i]}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-12 text-center text-xl font-bold bg-amber-100 border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-300 focus:ring-opacity-50 ${
                    error ? "border-red-500" : ""
                  }`}
                  maxLength={1}
                />
                {i === 1 && (
                  <span className="absolute -top-3 -right-6 text-amber-400 text-lg">
                    🐾
                  </span>
                )}
                {i === 2 && (
                  <span className="absolute -bottom-3 -left-6 text-amber-400 text-lg">
                    🐾
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-amber-600 text-sm mt-8">
            {getText("trucker.passcode.quote")}
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={onClose}
            className="bg-amber-200 text-amber-800 hover:bg-amber-300"
          >
            {getText("trucker.passcode.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}