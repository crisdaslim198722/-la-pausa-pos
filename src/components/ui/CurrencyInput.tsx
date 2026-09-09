"use client";

import React, { useState, useEffect } from "react";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  const formatNumber = (val: string) => {
    if (!val) return "";
    // Remove all characters except digits and dot
    let clean = val.replace(/[^\d.]/g, "");
    
    // Prevent multiple dots
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (clean === "") return "";
    if (clean === ".") return "0.";

    const numberParts = clean.split('.');
    let integerPart = numberParts[0];
    const decimalPart = numberParts.length > 1 ? '.' + numberParts[1] : '';

    // Remove leading zeros
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = parseInt(integerPart, 10).toString();
    }

    // Add commas for thousands
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return integerPart + decimalPart;
  };

  useEffect(() => {
    // Only update display if it's not focused, to avoid cursor jumps while typing
    if (value !== undefined && value !== null) {
      if (document.activeElement !== document.getElementById(props.id || '')) {
         setDisplayValue(formatNumber(value.toString()));
      }
    }
  }, [value, props.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty
    if (inputValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const formatted = formatNumber(inputValue);
    setDisplayValue(formatted);

    // Convert back to number for onChange
    const rawNumber = parseFloat(formatted.replace(/,/g, ''));
    if (!isNaN(rawNumber)) {
      onChange(rawNumber);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      {...props}
    />
  );
}
