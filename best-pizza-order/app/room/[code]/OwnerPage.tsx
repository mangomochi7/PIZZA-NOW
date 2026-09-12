import { Participant, Room } from "@/types/db";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

export default function OwnerPage({ room, user }: {
    room: Room,
    user: User
}) {
    const [participants, setParticipants] = useState<Participant[]>([]);

    return (
        <main className="flex flex-col w-full h-full justify-center items-center">
        </main>
    );
}