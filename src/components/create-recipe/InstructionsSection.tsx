"use client";
import React from "react";

interface InstructionsSectionProps {
  instructions: string[];
  addInstructionStep: () => void;
  removeInstructionStep: (index: number) => void;
  handleInstructionChange: (index: number, value: string) => void;
}

export default function InstructionsSection({
  instructions,
  addInstructionStep,
  removeInstructionStep,
  handleInstructionChange,
}: InstructionsSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fillRule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        Instructions
      </h2>
      <div className="space-y-4">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1">
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <div className="flex-grow">
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                rows={2}
                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                placeholder={`Step ${index + 1} instructions...`}
              />
            </div>
            <button
              type="button"
              onClick={() => removeInstructionStep(index)}
              className="text-red-600 hover:text-red-900 mt-2"
              disabled={instructions.length <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
        <div className="pt-2">
          <button
            type="button"
            onClick={addInstructionStep}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Step
          </button>
        </div>
      </div>
    </div>
  );
}
