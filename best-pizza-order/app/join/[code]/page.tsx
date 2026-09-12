"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/auth";

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();

  const code = params.code as string;

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [row, setRow] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const participantName = name.trim();
    const seatRow = row.trim().toUpperCase();

    if (!participantName) {
      setError("Please enter your name.");
      return;
    }

    if (!region) {
      setError("Please select a region.");
      return;
    }

    if (!seatRow) {
      setError("Please enter your row.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await getOrCreateUser();

      // Find the room using the code from the URL
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id, code")
        .eq("code", code.toUpperCase())
        .single();

      if (roomError || !room) {
        setError("Room not found.");
        return;
      }

      // Add participant
      const { error: participantError } = await supabase
        .from("participants")
        .insert({
          room_id: room.id,
          user_id: user.id,
          name: participantName,
          region,
          row: seatRow,
          status: "waiting",
        });

      if (participantError) {
        console.error(participantError);
        setError("Could not join the room. Please try again.");
        return;
      }

      router.push(`/room/${room.code}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold">
          Tell us about yourself
        </h1>

        <p className="mb-6 text-gray-400">
          Enter your name and where you're sitting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:border-white focus:outline-none"
            />
          </div>

          {/* Region */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Region
            </label>

            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:border-white focus:outline-none"
            >
              <option value="" disabled>
                Select a region
              </option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Row */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Row
            </label>

            <input
              type="text"
              value={row}
              onChange={(e) => setRow(e.target.value)}
              placeholder="A"
              maxLength={1}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 uppercase text-white placeholder:text-gray-500 focus:border-white focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black transition-opacity disabled:opacity-50"
          >
            {loading ? "Entering..." : "Enter Room"}
          </button>
        </form>
      </div>
    </main>
  );
}