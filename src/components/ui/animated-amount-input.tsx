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
  
  // Local string state to handle empty or intermediate states
  const [inputValue, setInputValue] = useState(value ? value.toString() : "");

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [autoFocus]);

  // Synchronize external value changes if they don't match our local parsed state
  useEffect(() => {
    if (value !== parseFloat(inputValue || "0")) {
      setInputValue(value ? value.toString() : "");
    }
  }, [value, inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
       onChange(parsed);
    } else {
       onChange(0);
    }
  };

  const getDisplayValue = (val: string) => {
    if (!val) return "0";
    
    // Split on dot (standard number input separator)
    const parts = val.split(".");
    
    // Format integer part with es-AR (dots for thousands)
    const integerPart = parseInt(parts[0] || "0", 10);
    const formattedInteger = isNaN(integerPart) ? "0" : integerPart.toLocaleString("es-AR");
    
    if (parts.length > 1) {
      // It has decimals
      return `${formattedInteger},${parts[1]}`;
    }
    
    return formattedInteger;
  };

  return (
    <div 
      className={`relative flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all cursor-text overflow-hidden ${isFocused ? 'bg-primary/5 ring-2 ring-primary scale-[1.01]' : 'bg-muted/30 hover:bg-muted/50 border border-border'}`}
      onClick={() => inputRef.current?.focus()}
    >
      <input 
        ref={inputRef}
        type="number" 
        inputMode="decimal"
        step="0.01"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onWheel={(e) => {
          // Desactiva el input temporalmente para evitar que la rueda sume/reste
          const target = e.target as HTMLInputElement;
          target.blur();
        }}
        className="absolute inset-0 opacity-0 w-full h-full cursor-text"
        style={{ fontSize: '16px' }} // prevent iOS zoom
      />
      
      <div className="flex items-center justify-center pointer-events-none">
        <span className={`text-2xl font-medium mr-2 mt-1 transition-colors ${!inputValue ? 'text-muted-foreground/30' : 'text-primary'}`}>$</span>
        <div className={`text-4xl sm:text-5xl font-bold tracking-tighter transition-colors ${!inputValue ? 'text-muted-foreground/30' : 'text-foreground'}`}>
          {getDisplayValue(inputValue)}
        </div>
      </div>
      {!inputValue && (
        <span className="text-sm text-muted-foreground mt-1 pointer-events-none">Toca para ingresar el monto</span>
      )}
    </div>
  );
}
