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
        async function loadParticipantInfo() {
            const { data: info, error } = await supabase
                .from("participants")
                .select("*")
                .eq("room_id", room.id)
                .eq("user_id", user.id)
                .single();
            
            console.log(error);
            
            if(!info) {
                router.push("/");
                return;
            }

            setParticipant(info);
        }

        loadParticipantInfo();
    }, [room, user]);

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
            />
        </main>
    );
}