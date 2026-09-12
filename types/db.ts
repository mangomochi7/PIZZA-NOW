export type ParticipantStatus =
    | "waiting"
    | "selected"
    | "returning"
    | "returned";

export type Participant = {
    id: string;
    user_id: string;
    room_id: string;
    name: string;
    region: "left" | "center" | "right";
    row: string;
    status: ParticipantStatus;
    created_at: string;
};

export type Room = {
    id: string;
    owner_id: string;
    code: string;
    created_at: string;
}