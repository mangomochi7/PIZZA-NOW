import ParticipantView from "@/components/ParticipantView";
import { supabase } from "@/lib/supabase";
import { Participant, Room } from "@/types/db";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ParticipantPage({ room, user }: {
    room: Room,
    user: User
}) {
    const [participant, setParticipant] = useState<Participant | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function loadParticipant() {
            const { data: newParticipant, error } = await supabase
                .from("participants")
                .select("*")
                .eq("room_id",room.id)
                .eq("user_id",user.id)
                .single();
            
            if(error) {
                console.error(error);
                return;
            }

            setParticipant(newParticipant);
        }

        loadParticipant();
    }, [room.id, user.id]);

    useEffect(() => {
        const channel = supabase
            .channel(`participant-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "participants",
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log(payload.new);
                    setParticipant(payload.new as Participant);
                }
            )
            .subscribe((status) => {
                console.log("Realtime status:", status);
            });
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user.id]);

    if(!participant) {
        return (
            <main className="flex flex-col w-full h-full justify-center items-center">
                <p>Loading...</p>
            </main>
        );
    }

    return (
        <main className="flex flex-col w-full h-full justify-center items-center">
            <ParticipantView 
                name={participant.name}
                row={participant.row}
                region={participant.region}
                roomCode={room.code}
                isMyTurn={participant.status === "selected"}
            />
        </main>
    );
}