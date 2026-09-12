"use client";

import { getOrCreateUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [curRoomCode, setCurRoomCode] = useState<string>("");

  const router = useRouter();

  const generateRoomCode = customAlphabet(
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
      6
  ); 

  const handleCreateRoom = async () => {
    setLoading(true);

    // check/add as valid user
    const user = await getOrCreateUser();
    
    // creates room
    const code = generateRoomCode();

    const { data, error: thisError } = await supabase
      .from("rooms")
      .insert({ 
        code,
        owner_id: user.id
      })
      .select()
      .single();
    
    if(thisError) {
      setError(thisError.message);
      return;
    }

    // redirects to correct room slug upon success
    router.push(`/room/${data.code}`);
  }

  const handleJoinRoom = async () => {
    setLoading(true);

    // check/add as valid user
    const user = await getOrCreateUser();
    
    // joining room
    const { data: room, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", curRoomCode)
      .maybeSingle();
    
    // room doesn't exist
    if(!room || roomsError) {
      setError(roomsError?.message ?? "Room doesn't exist");
      return;
    }

    // enter room

    // check ownership
    if(user.id === room.owner_id) router.push(`/room/${curRoomCode}`);
    else {
      // check if id already exists
      const { data: ptc, error: ptcError } = await supabase
        .from("participants")
        .select("*")
        .eq("user_id", user.id)
        .eq("room_id", room.id);
      
      if(((ptc?.length ?? 0) > 0) && !ptcError) router.push(`/room/${curRoomCode}`);
      else router.push(`/join/${curRoomCode}`);
    }
  }

  if(error) {
    return (
      <main className="flex flex-col w-full h-full justify-center items-center">
        <p>Error: {error}</p>
      </main>
    );
  }
  
  if(loading) {
    return (
      <main className="flex flex-col w-full h-full justify-center items-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full h-full justify-center items-center">
      <div className="flex flex-col p-2 gap-2 justify-center items-center">
          <button
            onClick={handleCreateRoom}
            className="w-fit bg-gray-800 p-2 rounded-md"
          >
            Create Room
          </button>
          <p>or</p>
          <div className="flex flex-col gap-2 justify-center items-center">
            <input
              value={curRoomCode}
              onChange={(e) => setCurRoomCode(e.target.value.toUpperCase())}
              className="border-2 border-gray-800"
            />
            <button
              onClick={handleJoinRoom}
              className="w-fit bg-gray-800 p-2 rounded-md"
            >
              Join Room
            </button>
          </div>
        </div>
    </main>
  );
}
