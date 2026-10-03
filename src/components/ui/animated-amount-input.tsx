"use client";

import { useState, useRef, useEffect } from "react";

interface AnimatedAmountInputProps {
  value: number;
  onChange: (val: number) => void;
  autoFocus?: boolean;
}

export function AnimatedAmountInput({ value, onChange, autoFocus }: AnimatedAmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [inputValue, setInputValue] = useState(value ? value.toString() : "");

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value !== parseFloat(inputValue || "0")) {
      setInputValue(value ? value.toString() : "");
    }
  }, [value, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Mercado Pago style: Strict physical blocks
    // 1. No negatives allowed (if by some magic they bypass the keydown)
    if (val.includes('-')) return;
    
    // 2. Hard limit of 10 digits before the decimal point, 2 after.
    // Or just a max raw length of 12 characters.
    if (val.length > 12) return; 

    setInputValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
       onChange(parsed);
    } else {
       onChange(0);
    }
  };

  // Mercado Pago style validation on key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing negative sign, exponential 'e', or plus sign
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const getDisplayValue = (val: string) => {
    if (!val) return "0";
    
    const parts = val.split(".");
    const integerPart = parseInt(parts[0] || "0", 10);
    const formattedInteger = isNaN(integerPart) ? "0" : integerPart.toLocaleString("es-AR");
    
    if (parts.length > 1) {
      return `${formattedInteger},${parts[1]}`;
    }
    return formattedInteger;
  };

  const displayValue = getDisplayValue(inputValue);
  const len = displayValue.length;
  
  // Shrink font size aggressively to ensure it NEVER breaks out of a standard ~350px mobile screen
  const sizeClass = len > 14 ? 'text-xl' : len > 10 ? 'text-3xl' : len > 7 ? 'text-4xl' : 'text-5xl sm:text-6xl';

  return (
    <div 
      className={`relative flex flex-col items-center justify-center py-4 px-4 rounded-2xl transition-all cursor-text overflow-hidden w-full max-w-full ${isFocused ? 'bg-primary/5 ring-2 ring-primary scale-[1.01]' : 'bg-muted/30 hover:bg-muted/50 border border-border'}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input 
        ref={inputRef}
        type="number" 
        inputMode="decimal"
        step="0.01"
        min="0"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onWheel={(e) => {
          const target = e.target as HTMLInputElement;
          target.blur();
        }}
        className="absolute inset-0 opacity-0 w-full h-full cursor-text"
        style={{ fontSize: '16px' }}
      />
      
      <div className="flex items-center justify-center pointer-events-none w-full px-2 min-w-0 overflow-hidden">
        <span className={`font-medium mr-2 mt-1 shrink-0 transition-colors ${len > 10 ? 'text-xl' : 'text-2xl'} ${!inputValue ? 'text-muted-foreground/30' : 'text-primary'}`}>$</span>
        <div className={`${sizeClass} font-bold tracking-tighter transition-colors truncate min-w-0 break-all max-w-full ${!inputValue ? 'text-muted-foreground/30' : 'text-foreground'}`}>
          {displayValue}
        </div>
      </div>
      {!inputValue && (
        <span className="text-sm text-muted-foreground mt-1 pointer-events-none shrink-0">Toca para ingresar el monto</span>
      )}
    </div>
  );
}
