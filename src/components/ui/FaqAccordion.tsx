"use client";

import { useState } from "react";
import type { Faq } from "@/data/extras";

export function FaqAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-cream">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
            >
              <span className="font-display text-lg text-forest">{item.question}</span>
              <span
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest transition-transform duration-200 ${
                  open ? "rotate-45 border-terracotta text-terracotta" : ""
                }`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            {open && (
              <div className="px-6 pb-6">
                <p className="max-w-2xl text-sm leading-relaxed text-charcoal-soft">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
