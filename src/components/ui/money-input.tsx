"use client";

import { useState, useEffect, useRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}

function formatMoney(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("id-ID");
}

function parseMoney(input: string): number {
  const digits = input.replace(/[^0-9]/g, "");
  if (digits === "") return 0;
  return parseInt(digits, 10);
}

export function MoneyInput({ value, onChange, error, className, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(formatMoney(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatMoney(value));
    }
  }, [value, isFocused]);

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : String(value));
    setTimeout(() => {
      e.target.select();
    }, 0);
    props.onFocus?.(e);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const parsed = parseMoney(raw);
    setDisplayValue(raw.replace(/[^0-9]/g, ""));
    onChange(parsed);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    setDisplayValue(formatMoney(value));
    props.onBlur?.(e);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    props.onKeyDown?.(e);
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        Rp
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border bg-white pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger focus:ring-danger/20 focus:border-danger",
          className
        )}
        {...props}
      />
    </div>
  );
}
