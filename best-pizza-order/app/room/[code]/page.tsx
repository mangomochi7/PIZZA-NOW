import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{
        code: string;
    }>;
};

export default async function RoomPage({ params }: Props) {
    const { code } = await params;

    const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();
    
    if(!room) {
        notFound();
    }

    return (
        <main className="flex flex-col w-full h-full justify-center items-center">
            <h1>Room {code}</h1>
        </main>
    )
}