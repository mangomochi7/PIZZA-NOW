"use client";

import JoinView from "@/components/JoinView";

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
    <JoinView
      code={code}
      name={name}
      region={region}
      row={row}
      loading={loading}
      error={error}
      onNameChange={setName}
      onRegionChange={setRegion}
      onRowChange={setRow}
      onSubmit={handleSubmit}
    />
  );
}