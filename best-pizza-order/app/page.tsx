"use client";

import { getOrCreateUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import './globals.css';

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
<<<<<<< HEAD
    const { error: thisError } = await supabase
=======
    const { data: room, error: roomsError } = await supabase
>>>>>>> 8d62ed80b665c1c78134e87164b31b2289f3ac26
      .from("rooms")
      .select("code")
      .eq("code", curRoomCode)
      .maybeSingle();
    
    // room doesn't exist
<<<<<<< HEAD
    if(thisError) {
      setError(thisError.message);
=======
    if(!room || roomsError) {
      setError(roomsError?.message ?? "Room doesn't exist");
>>>>>>> 8d62ed80b665c1c78134e87164b31b2289f3ac26
      return;
    }

    // enter room
<<<<<<< HEAD
    router.push(`/join/${curRoomCode}`);
=======
    
    // check if id already exists
    const { data: ptc, error: ptcError } = await supabase
      .from("participants")
      .select("*")
      .eq("user_id", user.id)
      .eq("room_id", room.id);
    
    console.log(ptc);
    console.log(user.id);
    console.log(room.id);
    
    if(((ptc?.length ?? 0) > 0) && !ptcError) router.push(`/room/${curRoomCode}`);
    else router.push(`/join/${curRoomCode}`);
>>>>>>> 8d62ed80b665c1c78134e87164b31b2289f3ac26
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
    <main className="flex min-h-screen w-full items-center justify-center bg-[#FFF8EE] px-8 py-8 text-[#211A16]">      <div className="content-box">
      <div className="flex w-full max-w-md flex-col gap-8 rounded-[2rem] border-2 border-[#211A16] bg-white px-8 py-12 text-center shadow-[8px_8px_0px_#211A16]"></div>
        <div>
            <h1 className="text-5xl font-black tracking-tight">
              PIZZA! NOW!
            </h1>
          </div>
          
          <button
          onClick={handleCreateRoom}
          className="w-full rounded-2xl border-2 border-[#211A16] bg-[#f7774d] px-8 py-4 text-xl font-black text-white shadow-[5px_5px_0px_#211A16] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#211A16] active:translate-y-1 active:shadow-[2px_2px_0px_#211A16]"
        >
          Create Room
        </button>

        <div className="flex w-full items-center gap-4">
          <div className="h-0.5 flex-1 bg-[#211A16] opacity-10" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#8A7568]">
            Or
          </p>
          <div className="h-0.5 flex-1 bg-[#211A16] opacity-10" />
        </div>
          
        <div className="flex flex-col gap-4">
          <input
            value={curRoomCode}
            onChange={(e) => setCurRoomCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            className="w-full rounded-2xl border-2 border-[#211A16] bg-[#FFF8EE] px-6 py-4 text-center text-3xl font-black tracking-widest text-[#211A16] shadow-[inset_3px_3px_0px_rgba(33,26,22,0.1)] placeholder:text-[#8A7568]/50 focus:outline-none focus:ring-2 focus:ring-[#211A16]"
            maxLength={6}
          />
          <button
            onClick={handleJoinRoom}
            className="w-full rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-8 py-4 text-xl font-black shadow-[5px_5px_0px_#211A16] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#211A16] active:translate-y-1 active:shadow-[2px_2px_0px_#211A16]"
          >
            Join Room
          </button>
        </div>
        </div>
        
    </main>
  );
  }
}
