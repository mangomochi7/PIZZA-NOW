"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/auth";

export default function ParticipantSetupPage() {
  const params = useParams();
  const router = useRouter();

  const code = params.code as string;

  const [name, setName] = useState("");
  const [seat, setSeat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!seat.trim()) {
      setError("Please enter your seat number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get the currently authenticated user
      const user = await getOrCreateUser();

      // Find the room
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("id, code")
        .eq("code", code.toUpperCase())
        .single();

      if (roomError || !room) {
        setError("Room not found.");
        return;
      }

      // Add this person as a participant
      const { error: participantError } = await supabase
        .from("participants")
        .insert({
          room_id: room.id,
          user_id: user.id,
          name: name.trim(),
          seat: seat.trim(),
        });

      if (participantError) {
        console.error(participantError);
        setError("Could not join the room. Please try again.");
        return;
      }

      // Enter the room
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
          Join Room {code.toUpperCase()}
        </h1>

        <p className="mb-8 text-gray-600">
          Tell us a little about yourself.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="seat"
              className="mb-2 block text-sm font-medium"
            >
              Seat number
            </label>

            <input
              id="seat"
              type="text"
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              placeholder="e.g. A12"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>
      </div>
    </main>
  );
}