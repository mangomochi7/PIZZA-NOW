"use client";

import { useState } from "react";

export default function ParticipantView({ name }: { name: string }) {
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

      <button
        onClick={() => setIsPizzaForMe(!isPizzaForMe)}
        className="bg-white px-4 py-2 rounded-lg shadow"
      >
        Toggle Pizza Status
      </button>

      {isPizzaForMe ? (
        <div className="mt-4 text-2xl font-bold">
          You are getting a pizza!
        </div>
      ) : (
        <div className="mt-4 text-2xl font-bold">
          You are not getting a pizza.
        </div>
      )}
    </div>
  );
}