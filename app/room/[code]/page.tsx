"use client";

import { supabase } from "@/lib/supabase";
import { Room } from "@/types/db";
import { notFound, useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OwnerPage from "./OwnerPage";
import ParticipantPage from "./ParticipantPage";

export default function RoomPage() {
    const [user, setUser] = useState<any>(null);
    const [room, setRoom] = useState<Room | null>(null);

    const [isOwner, setIsOwner] = useState<boolean | null>(null);
    
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const code = params.code as string;

    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            // get auth user
            const { data: {user} } = await supabase.auth.getUser();
            if(!user) {
                router.push("/");
                return;
            }
            setUser(user);

            // get room
            const { data: room, error } = await supabase
                .from("rooms")
                .select("*")
                .eq("code", code)
                .single();
            setRoom(room);
            setError(error ? error.message : null);

            // owner?
            setIsOwner(user.id === room.owner_id);
        }

        loadData();
    }, [code]);

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

    if(isOwner) {
        return (
            <OwnerPage 
                room={room}
                user={user}
            />
        );
    } else {
        return (
            <ParticipantPage
                room={room}
                user={user} 
            />
        );
    }
}