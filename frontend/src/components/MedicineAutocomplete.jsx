import { useEffect, useId, useRef, useState } from 'react';
import { getMedicineSuggestions } from '../utils/medicineSuggestions';

const MedicineAutocomplete = ({ value, specialty, onChange, rowIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputId = useId();
  const listId = `${inputId}-suggestions`;
  const suggestions = getMedicineSuggestions(specialty, value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const selectSuggestion = (medicine) => {
    if (typeof medicine !== 'string' || !medicine.trim() || typeof onChange !== 'function') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    onChange(medicine);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      event.preventDefault();
      const medicine = suggestions[activeIndex];
      if (medicine) selectSuggestion(medicine);
    }
  };

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <input
        id={`${inputId}-${rowIndex}`}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(-1);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Medicine"
        aria-label={`Medicine name, row ${rowIndex + 1}`}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
      />

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            <ul id={listId} role="listbox" className="max-h-52 overflow-y-auto py-1">
              {suggestions.map((medicine, index) => (
                <li
                  id={`${listId}-option-${index}`}
                  key={medicine}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={(event) => {
                      event.preventDefault();
                      selectSuggestion(medicine);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                      index === activeIndex
                        ? 'bg-sky-50 text-sky-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {medicine}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-xs text-slate-500">
              No matching suggestions. You can enter a medicine manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineAutocomplete;
