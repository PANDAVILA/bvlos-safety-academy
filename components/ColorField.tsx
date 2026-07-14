"use client";

import { useState } from "react";

export default function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div>
      <label className="eyebrow text-navy-900/60">{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={isValid ? value : "#000000"}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 w-14 cursor-pointer border border-navy-900/20"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#0A1B33"
          className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
        />
      </div>
      {!isValid && <p className="mt-1 text-xs text-red-600">Enter a valid hex color, e.g. #0A1B33</p>}
    </div>
  );
}
