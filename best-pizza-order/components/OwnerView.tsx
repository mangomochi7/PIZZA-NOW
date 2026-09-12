import { Participant, Room } from "@/types/db";

export default function OwnerView({ room, participants }: {
  room: Room;
  participants: Participant[];
}) {
  return (
    <main className="min-h-screen w-full bg-[#FFF8EE] px-8 py-8 text-[#211A16]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">

        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black tracking-tight">
                PIZZA! NOW!
              </h1>
            </div>
          </div>

          {/* Room code */}
          <div className="rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-7 py-4 text-center shadow-[4px_4px_0px_#211A16]">
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              ROOM CODE:
            </p>
            <p className="text-3xl font-black tracking-widest">
              {room.code}
            </p>
          </div>
        </header>

        {/* Main status */}
        <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-[#f7774d] px-10 py-14 text-center text-white shadow-[8px_8px_0px_#211A16]">

          <div className="absolute -right-8 -top-10 rotate-12 text-[9rem] opacity-20">
            🍕
          </div>

          <div className="absolute -bottom-12 -left-8 -rotate-12 text-[8rem] opacity-20">
            🍕
          </div>

          <p className="relative text-lg font-black uppercase tracking-[0.25em] opacity-80">
            Most Recently Released
          </p>

          <h2 className="relative mt-2 text-8xl font-black tracking-tight">
            Row *row*
          </h2>

          <p className="relative mt-4 text-2xl font-bold font-medium opacity-90">
            Head to the front for your pizza!
          </p>

        </section>

        {/* Participants */}
        <section className="mt-10 flex-1">

          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#E94F37]">
                Who's waiting?
              </p>

              <h2 className="text-4xl font-black">
                Participants
              </h2>
            </div>

            <div className="text-right">
              <p className="text-4xl font-black">
                {participants.length}
              </p>
              <p className="text-sm font-bold text-[#8A7568]">
                people
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {participants.map((ptc: Participant) => (
              <div
                key={ptc.id}
                className="flex items-center justify-between rounded-2xl border-2 border-[#211A16] bg-white px-5 py-4 shadow-[3px_3px_0px_#211A16]"
              >
                <div>
                  <p className="text-xl font-black">
                    {ptc.name}
                  </p>

                  <p className="text-sm font-semibold text-[#8A7568]">
                    Row {ptc.row}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-end">
          <button
            className="rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-8 py-4 text-xl font-black shadow-[5px_5px_0px_#211A16] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#211A16] active:translate-y-1 active:shadow-[2px_2px_0px_#211A16]"
          >
            Release Next Row
          </button>
        </div>

      </div>
    </main>
  );
}