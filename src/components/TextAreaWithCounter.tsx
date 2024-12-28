import React, { useState } from 'react';

interface TextAreaWithCounterProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}

const TextAreaWithCounter: React.FC<TextAreaWithCounterProps> = ({ value, onChange, maxLength }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxLength) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <textarea
        className="mt-2 w-full p-2 border border-gray-300 rounded-md"
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
      />
      <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
        {value.length}/{maxLength}
      </div>
    </div>
  );
};

export default TextAreaWithCounter;