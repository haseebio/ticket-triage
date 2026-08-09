'use client';

import { useState } from 'react';

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="flex flex-col gap-2">
      {items.map(([question, answer], i) => {
        const open = openIndex === i;
        return (
          <div key={question} className="overflow-hidden rounded-lg border border-line">
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-ink transition-colors ${
                open ? 'bg-primary-soft/40' : 'bg-surface'
              }`}
            >
              {question}
              <span className={`text-primary transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && (
              <div className="border-t border-line bg-primary-soft/20 px-4 py-3 text-sm leading-relaxed text-fog">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}