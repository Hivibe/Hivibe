// components/notes/note-card.tsx
"use client";

import { Star } from "lucide-react";
import type { Note } from "@/types";

const BRAND = "#63C1ED";

interface NoteCardProps {
  n: Note;
  selNote: number | null;
  setSelNote: (id: number) => void;
  toggleNoteFav: (id: number) => void;
}

export function NoteCard({
  n,
  selNote,
  setSelNote,
  toggleNoteFav,
}: NoteCardProps) {
  return (
    <div
      onClick={() => setSelNote(n.noteId)}
      className="p-4 rounded-xl border cursor-pointer transition-all mb-2.5"
      style={
        selNote === n.noteId
          ? { borderColor: `${BRAND}55`, background: `${BRAND}0d` }
          : {}
      }
    >
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <h3 className="font-ko text-sm font-bold text-foreground leading-snug flex-1">
          {n.noteName}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNoteFav(n.noteId);
            }}
            className="h-6 w-6 flex items-center justify-center rounded transition-colors hover:bg-accent"
            style={{ color: n.bkmkYn === "Y" ? "#f59e0b" : "#71717a" }}
          >
            <Star
              className={`h-3.5 w-3.5 ${n.bkmkYn === "Y" ? "fill-amber-400" : ""}`}
            />
          </button>
        </div>
      </div>
      <p className="font-ko text-xs text-muted-foreground mb-2.5">
        {new Date(n.createdAt).toLocaleDateString("ko-KR")}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {n.tag
          ?.split(" ")
          .filter(Boolean)
          .map((t) => (
            <span
              key={t}
              className="font-ko text-[11px] px-1 py-0.5 rounded-full border border-border text-muted-foreground"
            >
              {t}
            </span>
          ))}
      </div>
    </div>
  );
}