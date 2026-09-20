"use client";

const EXAMPLES = [
  "How many annual leave days do employees receive?",
  "What is the process to request parental leave?",
  "Summarize our remote-work policy.",
  "What are the latest public holiday rules in Bangladesh?",
];

export function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-8 text-center">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white">
        <span className="font-serif text-xl font-medium leading-none">H</span>
      </div>
      <h2 className="font-serif text-4xl font-normal tracking-tight text-foreground">
        <span className="text-accent">✳</span> {greeting}
      </h2>
      <p className="mt-3 text-[15px] text-muted-strong">
        Ask about company HR policy. I&apos;ll route to your knowledge base, search
        the web, or answer directly — with citations.
      </p>

      <div className="mt-10 w-full space-y-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-left text-sm text-foreground transition hover:border-border-strong hover:bg-surface"
          >
            <span className="flex-1">{ex}</span>
            <span className="text-muted opacity-0 transition group-hover:opacity-100">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
