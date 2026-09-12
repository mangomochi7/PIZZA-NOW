"use client";

import { useState } from "react";

export default function ParticipantView({
  name,
  row,
}: {
  name: string;
  row: number;
}) {
  const [isPizzaForMe, setIsPizzaForMe] = useState(false);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative ${
        isPizzaForMe ? "bg-green-400" : "bg-red-400"
      }`}
    >
      <h1 className="absolute top-8 text-3xl font-bold">
        Hi {name}!
      </h1>

      {/* Temporary toggle button - easy to delete later */}
      <button
        onClick={() => setIsPizzaForMe(!isPizzaForMe)}
        className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-300"
      >
        Toggle Pizza Status
      </button>

      {/* Row number */}
      <div className="bg-white px-6 py-3 rounded-lg shadow text-xl font-semibold text-gray-300">
        Row: {row}
      </div>

      {isPizzaForMe ? (
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold">
            Your row has been released!
          </div>
          <div className="mt-2 text-xl font-medium">
            Get your pizza at the front.
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold">
            Your row has not been released yet.
          </div>
          <div className="mt-2 text-xl font-medium">
            Please wait for your row to be released.
          </div>
        </div>
      )}
    </div>
  );
}