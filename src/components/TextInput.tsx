import React from "react";

interface TextAreaLabelProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export function TextAreaLabel({
  label,
  value,
  onChange,
  placeholder,
  required,
}: TextAreaLabelProps) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        className="w-full mt-1 p-2 border rounded"
        placeholder={placeholder}
      ></textarea>
    </div>
  );
}

interface SelectLabelProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export function SelectLabel({
  label,
  value,
  onChange,
  options,
  required,
}: SelectLabelProps) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full mt-1 p-2 border rounded"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
