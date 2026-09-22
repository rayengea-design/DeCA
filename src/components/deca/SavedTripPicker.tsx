import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/Input'
import type { SavedTrip } from '@/types/deca'

function normalize(s: string): string {
  // Strips accents (José → jose) so a search typed without them still
  // matches — common when people are typing route/client names fast.
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function matches(trip: SavedTrip, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalize(
    [trip.nombre, trip.counterpartNombre, trip.origen, trip.destino, trip.naturalezaMercancia].join(' '),
  )
  return words.every((word) => haystack.includes(word))
}

interface SavedTripPickerProps {
  trips: SavedTrip[]
  onSelect: (trip: SavedTrip) => void
}

// A search box, not a plain dropdown: with more than a handful of saved
// trips, scanning a closed list of labels for the right one is slow —
// typing any word from the client, ruta or mercancía narrows it down
// immediately instead.
export function SavedTripPicker({ trips, onSelect }: SavedTripPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = trips.filter((t) => matches(t, query))

  function pick(trip: SavedTrip) {
    onSelect(trip)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Busca por cliente, ruta o mercancía…"
          autoComplete="off"
          className="pl-9"
        />
      </div>
      {open && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-ink-100 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink-400">Sin resultados</li>
          ) : (
            filtered.map((trip) => (
              <li key={trip.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(trip)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-ink-50"
                >
                  <p className="font-medium text-ink-900">{trip.nombre}</p>
                  <p className="truncate text-xs text-ink-400">
                    {trip.counterpartNombre} · {trip.origen} → {trip.destino} · {trip.naturalezaMercancia}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
