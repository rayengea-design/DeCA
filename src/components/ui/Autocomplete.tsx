import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface AutocompleteProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onSelect'> {
  value: string
  onChange: (value: string) => void
  /** Called (in addition to onChange) when the user picks a suggestion from
   * the dropdown, so callers can fill other fields off the back of it (e.g.
   * picking a counterpart name also fills its NIF/domicilio). Named
   * onPickSuggestion, not onSelect, to avoid colliding with the native
   * <input onSelect> text-selection event from InputHTMLAttributes. */
  onPickSuggestion?: (value: string) => void
  suggestions: string[]
}

// Plain-text typeahead: filters the given suggestion list as the user types
// and lets them pick with the mouse or the keyboard. Not tied to any one
// data source — callers decide what list of strings to offer.
export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ value, onChange, onPickSuggestion, suggestions, className, onFocus, onBlur, onKeyDown, ...props }, ref) => {
    const [open, setOpen] = useState(false)
    const [highlight, setHighlight] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)

    // react-hook-form's Controller hands back `undefined` for a field with
    // no seeded defaultValues entry (unlike a plain <input>, which the DOM
    // defaults to '' on its own) — guard so a not-yet-typed-into field
    // doesn't crash here.
    const safeValue = value ?? ''
    const trimmed = safeValue.trim().toLowerCase()
    const filtered = trimmed
      ? suggestions.filter((s) => s.toLowerCase().includes(trimmed) && s.toLowerCase() !== trimmed).slice(0, 6)
      : suggestions.slice(0, 6)

    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function pick(s: string) {
      onChange(s)
      onPickSuggestion?.(s)
      setOpen(false)
      setHighlight(-1)
    }

    return (
      <div className="relative" ref={containerRef}>
        <Input
          ref={ref}
          value={safeValue}
          autoComplete="off"
          className={className}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setHighlight(-1)
          }}
          onFocus={(e) => {
            setOpen(true)
            onFocus?.(e)
          }}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (open && filtered.length > 0) {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setHighlight((i) => Math.min(i + 1, filtered.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setHighlight((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && highlight >= 0) {
                e.preventDefault()
                pick(filtered[highlight])
              } else if (e.key === 'Escape') {
                setOpen(false)
              }
            }
            onKeyDown?.(e)
          }}
          {...props}
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-ink-100 bg-white py-1 shadow-lg">
            {filtered.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  className={cn(
                    'block w-full truncate px-3 py-1.5 text-left text-sm',
                    i === highlight ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50',
                  )}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)
Autocomplete.displayName = 'Autocomplete'
