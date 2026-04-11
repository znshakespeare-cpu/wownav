import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { searchCnRealms } from '../data/cnRealms';

interface RealmComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RealmCombobox({ value, onChange, placeholder, className }: RealmComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const suggestions = useMemo(() => searchCnRealms(value, 20), [value]);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!value.trim()) close();
  }, [value, close]);

  const pick = (slug: string) => {
    onChange(slug);
    close();
  };

  return (
    <div ref={wrapRef} className="relative w-full min-w-0 lg:flex-1 lg:basis-0">
      <input
        id={id}
        type="text"
        value={value}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => {
          if (value.trim()) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) {
            if (e.key === 'ArrowDown' && value.trim()) setOpen(true);
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            close();
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
            return;
          }
          if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            pick(suggestions[active].slug);
          }
        }}
        className={className}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-auto rounded-lg border border-slate-700 bg-void-mid py-1 shadow-lg"
        >
          {suggestions.map((item, idx) => (
            <li key={`${item.slug}-${idx}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={idx === active}
                className={`flex w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/90 ${
                  idx === active ? 'bg-slate-800/90' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item.slug)}
              >
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
