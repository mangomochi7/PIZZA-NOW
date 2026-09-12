export type ParticipantStatus =
    | "waiting"
    | "selected"
    | "returning"
    | "returned";

export type Participant = {
    id: string;
    room_id: string;
    name: string;
    seat: string;
    status: ParticipantStatus;
    created_at: string;
};

export type Room = {
    id: string;
    code: string;
    created_at: string;
}