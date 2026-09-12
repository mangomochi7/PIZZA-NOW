import { supabase } from "@/lib/supabase";
import { Participant, Room } from "@/types/db";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerPage({ room, user }: {
    room: Room,
    user: User
}) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    
    const router = useRouter();

    useEffect(() => {
        async function loadParticipantsInfo() {
            const { data: info, error } = await supabase
                .from("participants")
                .select("*")
                .eq("room_id", room.id);
            
            console.log(error);
            
            if(!info || error) {
                router.push("/");
                return;
            }

            setParticipants(info);
        }

        loadParticipantsInfo();
    }, [room, user]);

    return (
        <main className="flex flex-col w-full h-full justify-center items-center">
            <p>Room Code: {room.code}</p>
            <div className="flex flex-col">
                <p>Participants:</p>
                { participants.map((ptc: Participant) => (
                    <p key={ptc.id}>
                        {ptc.name}
                    </p>
                ))}
            </div>
        </main>
    );
}