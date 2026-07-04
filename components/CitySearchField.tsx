"use client";

import { useCallback, useEffect, useRef, type FormEvent } from "react";

interface CitySearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  /** Компактный вид для выпадающего меню */
  compact?: boolean;
  /** aria-label для поля */
  label?: string;
}

export function CitySearchField({
  value,
  onChange,
  placeholder = "Найти населённый пункт…",
  id = "city-search",
  autoFocus = false,
  compact = false,
  label = "Поиск населённого пункта",
}: CitySearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const onClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  const onSubmit = useCallback((e: FormEvent) => e.preventDefault(), []);

  return (
    <form
      className={`city-search${compact ? " city-search--compact" : ""}`}
      role="search"
      onSubmit={onSubmit}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        enterKeyHint="search"
      />
      {value.length > 0 && (
        <button
          type="button"
          className="city-search-clear"
          aria-label="Очистить поиск"
          onClick={onClear}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </form>
  );
}
