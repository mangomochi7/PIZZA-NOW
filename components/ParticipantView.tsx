"use client";

import { useState } from "react";

export default function ParticipantView({
  name,
  row,
  region,
  roomCode,
  isMyTurn
}: {
  name: string,
  row: string,
  region: string,
  roomCode: string,
  isMyTurn: boolean,
}) {

  return (
    <main
      className={`min-h-screen w-full overflow-hidden px-4 py-6 sm:px-8 sm:py-8 text-[#211A16] transition-colors duration-500 ${
        isMyTurn ? "bg-green-400" : "bg-red-400"
      }`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]">
              PIZZA! NOW!
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              Hi {name}!
            </h1>
          </div>
          
        <div className="shrink-0 rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-4 py-3 text-center shadow-[4px_4px_0px_#211A16] sm:px-7 sm:py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] sm:text-xs sm:tracking-[0.2em]">
                ROOM CODE:
            </p>
            <p className="mt-1 text-xl font-black tracking-widest sm:text-3xl">
                {roomCode}
            </p>
        </div>

        </header>

        {/* Main status */}
        <section className="relative flex flex-1 flex-col items-center justify-center py-8 text-center sm:py-10">
          <div className="absolute -left-12 top-8 hidden rotate-[-12deg] text-7xl opacity-20 sm:block md:text-[7rem]">
            🍕
          </div>

          <div className="absolute -right-12 bottom-8 hidden rotate-[12deg] text-7xl opacity-20 sm:block md:text-[7rem]">
            🍕
          </div>

          {isMyTurn ? (
            <>
              <h2 className="relative text-5xl font-black tracking-tight sm:text-7xl md:text-8xl">
                YOU ARE UP!
              </h2>

              <div className="relative mt-6 w-full max-w-xl rounded-[1.5rem] border-2 border-[#211A16] bg-white px-5 py-5 shadow-[5px_5px_0px_#211A16] sm:mt-8 sm:rounded-[2rem] sm:px-8 sm:py-6 sm:shadow-[7px_7px_0px_#211A16]">
                <p className="text-xl font-black sm:text-2xl">
                  Your row has been released!
                </p>

                <p className="mt-2 text-base font-bold text-[#8A7568] sm:text-lg">
                  Head to the front and get your pizza.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="relative text-sm font-black uppercase tracking-[0.2em] sm:text-lg sm:tracking-[0.25em]">
                NOT YET!
              </p>

              <h2 className="relative mt-2 text-5xl font-black tracking-tight sm:text-7xl md:text-8xl">
                YOU ARE IN LINE
              </h2>

              <div className="relative mt-6 w-full max-w-xl rounded-[1.5rem] border-2 border-[#211A16] bg-white px-5 py-5 shadow-[5px_5px_0px_#211A16] sm:mt-8 sm:rounded-[2rem] sm:px-8 sm:py-6 sm:shadow-[7px_7px_0px_#211A16]">
                <p className="text-xl font-black sm:text-2xl">
                  Your row has not been released.
                </p>

                <p className="mt-2 text-base font-bold text-[#8A7568] sm:text-lg">
                  Please wait for your row to be released.
                </p>
              </div>
            </>
          )}

          <div className="mt-6 flex w-full max-w-xl gap-3 sm:mt-8">
            <div className="flex-1 rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-4 py-3 shadow-[3px_3px_0px_#211A16] sm:px-6 sm:py-3 sm:shadow-[4px_4px_0px_#211A16]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] sm:text-xs">
                Region
              </p>

              <p className="truncate text-xl font-black sm:text-2xl">
                {region}
              </p>
            </div>

            <div className="flex-1 rounded-2xl border-2 border-[#211A16] bg-[#ffbf66] px-4 py-3 shadow-[3px_3px_0px_#211A16] sm:px-6 sm:py-3 sm:shadow-[4px_4px_0px_#211A16]">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] sm:text-xs">
                Row
              </p>

              <p className="text-xl font-black sm:text-2xl">
                {row}
              </p>
            </div>
          </div>
        </section>

        {/* Temporary
        <div className="mt-4 flex justify-end sm:mt-8">
          <button
            onClick={() => setIsPizzaForMe(!isPizzaForMe)}
            className="rounded-xl border-2 border-[#211A16] bg-white px-3 py-2 text-xs font-black shadow-[3px_3px_0px_#211A16] transition hover:-translate-y-0.5 active:translate-y-0.5 sm:px-4 sm:text-sm"
          >
            Toggle Pizza Status
          </button>
        </div> */}
      </div>
    </main>
  );
}