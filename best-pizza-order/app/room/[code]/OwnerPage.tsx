import OwnerView from "@/components/OwnerView";
import { supabase } from "@/lib/supabase";
import { formQueue } from "@/script/form-queue";
import { Participant, Room } from "@/types/db";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OwnerPage({ room, user }: {
    room: Room,
    user: User
}) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [queue, setQueue] = useState<string[]>([]);
    const [releasedSect, setReleasedSect] = useState<string|null>(null);
    const [releasedRow, setReleasedRow] = useState<string|null>(null);
    
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
            
            const newQueue = await formQueue(info);
            setQueue(newQueue);
        }

        loadParticipantsInfo();
    }, [room, user]);

    const handlePopQueue = async () => {
        if(queue.length === 0) return;
        const nextGroupComp: string = queue.pop() ?? "";
        const [region, row] = nextGroupComp.split('-');

        if(!region || !row) return;

        // query for section, row
        const { data: nextInLine, error: queryError } = await supabase
            .from("participants")
            .select("*")
            .eq("region", region)
            .eq("row", row);
        
        // bad query
        if(!nextInLine || queryError) return;

        // mark next in line as selected
        const { error: updateError } = await supabase
            .from("participants")
            .update({ status: "selected" })
            .eq("room_id", room.id);

        if(updateError) {
            console.log(updateError);
            return;
        }

        // update released sect/row
        setReleasedSect(region);
        setReleasedRow(row);
    }

    return (
        <OwnerView
            room={room}
            participants={participants}
            curRow={releasedRow}
            curRegion={releasedSect}
            onReleaseRow={handlePopQueue}
        />
    );
}