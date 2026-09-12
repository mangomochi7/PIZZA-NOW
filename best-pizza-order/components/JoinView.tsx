"use client";

export default function JoinView({
    code, name, region, row, loading, error,
    onNameChange, onRegionChange, onRowChange, onSubmit,
}: {
  code: string;
  name: string;
  region: string;
  row: string;
  loading: boolean;
  error: string;
  onNameChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onRowChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FFF8EE] px-4 py-6 text-[#211A16] sm:px-8 sm:py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]">
              PIZZA! NOW!
            </p>

            <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
              Join the Room
            </h1>
          </div>

          <div className="shrink-0 rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-4 py-3 text-center shadow-[4px_4px_0px_#211A16] sm:px-6 sm:py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]">
              Room Code
            </p>

            <p className="mt-1 text-xl font-black tracking-widest sm:text-2xl">
              {code}
            </p>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col justify-center py-10">
          <div className="pointer-events-none absolute -left-16 top-10 hidden -rotate-12 text-[8rem] opacity-10 sm:block">
            🍕
          </div>

          <div className="pointer-events-none absolute -right-16 bottom-10 hidden rotate-12 text-[8rem] opacity-10 sm:block">
            🍕
          </div>

          <div className="relative rounded-[2rem] border-2 border-[#211A16] bg-white p-6 shadow-[7px_7px_0px_#211A16] sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#E94F37]">
                Almost there
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Tell us about yourself
              </h2>

              <p className="mt-2 text-base font-bold text-[#8A7568] sm:text-lg">
                Enter your name and where you're sitting.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em]">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border-2 border-[#211A16] bg-[#FFF8EE] px-4 py-3 text-lg font-bold text-[#211A16] outline-none transition placeholder:text-[#8A7568] focus:bg-white focus:shadow-[3px_3px_0px_#211A16]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em]">
                  Region
                </label>

                <select
                  value={region}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#211A16] bg-[#FFF8EE] px-4 py-3 text-lg font-bold text-[#211A16] outline-none transition focus:bg-white focus:shadow-[3px_3px_0px_#211A16]"
                >
                  <option value="" disabled>
                    Select a region
                  </option>

                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black uppercase tracking-[0.12em]">
                  Row
                </label>

                <input
                  type="text"
                  value={row}
                  onChange={(e) => onRowChange(e.target.value)}
                  placeholder="A"
                  maxLength={1}
                  autoComplete="off"
                  className="w-full rounded-xl border-2 border-[#211A16] bg-[#FFF8EE] px-4 py-3 text-lg font-bold uppercase text-[#211A16] outline-none transition placeholder:text-[#8A7568] focus:bg-white focus:shadow-[3px_3px_0px_#211A16]"
                />
              </div>

              {error && (
                <div className="rounded-xl border-2 border-[#211A16] bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border-2 border-[#211A16] bg-[#f7774d] px-6 py-4 text-xl font-black text-white shadow-[5px_5px_0px_#211A16] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#211A16] active:translate-y-1 active:shadow-[2px_2px_0px_#211A16] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entering..." : "Enter Room →"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}