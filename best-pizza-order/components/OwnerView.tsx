import { Participant, Room } from "@/types/db";

export default function OwnerView({ room, participants }: {
    room: Room,
    participants: Participant[]
}) {
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