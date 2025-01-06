import React from "react";
import { colors } from "../styles/theme";

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <svg
        className="animate-spin h-10 w-10 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={colors.heurtierColor}
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill={colors.heurtierColor}
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
    </div>
  );
}
