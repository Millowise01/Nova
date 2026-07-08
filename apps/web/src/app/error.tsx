"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <h2>Something went wrong!</h2>
      <button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded" onClick={reset}>
        Retry
      </button>
    </div>
  );
}

