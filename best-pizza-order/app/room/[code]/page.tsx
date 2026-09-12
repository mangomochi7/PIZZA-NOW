"use client";

import { supabase } from "@/lib/supabase";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomPage() {
    const [user, setUser] = useState<any>(null);
    const [room, setRoom] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const code = params.code as string;

    useEffect(() => {
        async function loadUser() {
            const { data: {user} } = await supabase.auth.getUser();
            setUser(user);
        }

        async function loadRoom() {
            const { data: room, error } = await supabase
                .from("rooms")
                .select("*")
                .eq("code", code)
                .single();
            setRoom(room);
            setError(error ? error.message : null);
        }

        loadUser();
        loadRoom();
    }, []);

    if(error) {
        notFound();
    }

    if(!user) {
        return (
            <main className="flex flex-col w-full h-full justify-center items-center">
                <p>Loading...</p>
            </main>
        );
    }
    
    if(!room) {
        return (
            <main className="flex flex-col w-full h-full justify-center items-center">
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="flex flex-col w-full h-full justify-center items-center">
            <h1>Hi</h1>
        </main>
    )
}