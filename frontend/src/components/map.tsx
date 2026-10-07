import { memo, useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { BAKU_CENTER } from '../lib/format'
import type { ComplaintStatus, Priority } from '../lib/types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/format'
import { useCurrentLocation, type CurrentLocationState } from '../hooks/useCurrentLocation'

const PIN_COLORS: Record<Priority, string> = {
  LOW: '#64748b',
  NORMAL: '#0ea5e9',
  HIGH: '#f97316',
  URGENT: '#e11d48',
}

function markerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;width:18px;height:18px;border-radius:9999px;
      background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(15,23,42,.45)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

/** Pulsing blue dot — the user's exact current position. */
const CURRENT_LOCATION_ICON = L.divIcon({
  className: '',
  html: `
    <span class="cur-dot">
      <span class="cur-dot-ring"></span>
      <span class="cur-dot-core"></span>
    </span>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

/** Keeps the viewport in sync when coordinates change outside of user interaction. */
function Recenter({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [position, map])
  return null
}

interface MarkerData {
  id: number
  title: string
  referenceCode: string
  status: ComplaintStatus
  priority: Priority
  latitude: number
  longitude: number
  district?: string | null
  categoryName?: string
}

function PickerEvents({ onPick }: { onPick: (position: [number, number]) => void }) {
  useMapEvents({
    click: (event) => onPick([event.latlng.lat, event.latlng.lng]),
  })
  return null
}

/** Floating control that asks the browser for the exact current position. */
function LocateControl({ state, onLocate }: { state: CurrentLocationState; onLocate: () => void }) {
  const locating = state.status === 'locating'
  const failed = state.status === 'error' || state.status === 'unsupported'

  return (
    <button
      type="button"
      onClick={onLocate}
      title={state.error ?? 'Mövqeyimi göstər'}
      aria-label="Mövqeyimi göstər"
      className={`absolute right-3 top-3 z-[1000] inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur transition active:translate-y-px ${
        failed
          ? 'border-rose-200 bg-rose-50/95 text-rose-700 hover:bg-rose-50'
          : 'border-slate-200 bg-white/95 text-slate-700 hover:bg-white hover:text-slate-900'
      }`}
    >
      {locating ? (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            d="M12 22a2 2 0 0 0 2-2c0-1.1-.4-2.1-1-3.1V7.1L6.5 19a2 2 0 0 0 .8 2.7 2 2 0 0 0 2-.3L12 20.3l2.7 1.1a2 2 0 0 0 2 .3A2 2 0 0 0 17.5 19L11 6.2a1 1 0 0 1 .4-1.4 1 1 0 0 1 1.2.2L22 13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {locating ? 'Axtarılır…' : failed ? 'Yenidən cəhd' : 'Mənim yerim'}
    </button>
  )
}

function CurrentLocationMarker({ position, accuracy }: { position: [number, number]; accuracy: number | null }) {
  return (
    <Marker position={position} icon={CURRENT_LOCATION_ICON} zIndexOffset={1000}>
      <Popup>
        <div className="min-w-32">
          <p className="text-sm font-semibold text-slate-900">Mənim yerim</p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
          {accuracy != null && (
            <p className="mt-1 text-xs text-slate-600">Dəqiqlik ±{Math.round(accuracy)} m</p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

/** Shared geolocation behaviour: my-location button + dashed mark. */
function useLocator() {
  const { locate, ...rest } = useCurrentLocation()
  return {
    locate,
    state: rest as CurrentLocationState,
    position: rest.position ? ([rest.position.lat, rest.position.lng] as [number, number]) : null,
  }
}

/** Click-to-pick map used when filing a complaint. */
export function LocationPicker({
  value,
  onChange,
  className = 'h-96',
  locator = true,
}: {
  value: { lat: number; lng: number } | null
  onChange: (position: [number, number]) => void
  className?: string
  locator?: boolean
}) {
  const { locate, state, position: myPosition } = useLocator()
  const position: [number, number] = value ? [value.lat, value.lng] : BAKU_CENTER

  async function handleLocate() {
    const coords = await locate()
    // The exact spot becomes the picked location right away.
    if (coords) onChange([coords.lat, coords.lng])
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}>
      <MapContainer center={BAKU_CENTER} zoom={12} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PickerEvents onPick={onChange} />
        <Recenter position={position} />
        {value && (
          <Marker position={position} icon={markerIcon('#e11d48')}>
            <Popup>Seçilmiş yer</Popup>
          </Marker>
        )}
        {myPosition &&
          (!value || Math.abs(myPosition[0] - value.lat) > 1e-5 || Math.abs(myPosition[1] - value.lng) > 1e-5) && (
            <CurrentLocationMarker position={myPosition} accuracy={state.accuracy} />
          )}
      </MapContainer>
      {locator && <LocateControl state={state} onLocate={handleLocate} />}
    </div>
  )
}

/** Read-only map with complaint markers. Canvas rendering keeps hundreds of pins smooth. */
export const MarkerMap = memo(function MarkerMap({
  markers,
  focus,
  className = 'h-96',
  locator = true,
}: {
  markers: MarkerData[]
  focus?: [number, number] | null
  className?: string
  locator?: boolean
}) {
  const { locate, state, position: myPosition } = useLocator()
  const center: [number, number] = focus ??
    (markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : BAKU_CENTER)

  return (
    <div className={`relative overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}>
      <MapContainer center={center} zoom={12} scrollWheelZoom preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {myPosition && <Recenter position={myPosition} />}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={markerIcon(PIN_COLORS[marker.priority])}
          >
            <Popup>
              <div className="min-w-40">
                <p className="font-mono text-[11px] text-slate-500">{marker.referenceCode}</p>
                <p className="text-sm font-semibold text-slate-900">{marker.title}</p>
                {marker.categoryName && (
                  <p className="mt-1 text-xs text-slate-600">{marker.categoryName}</p>
                )}
                <p className="mt-1 text-xs text-slate-600">
                  {STATUS_LABELS[marker.status]} · {PRIORITY_LABELS[marker.priority]}
                </p>
                {marker.district && <p className="text-xs text-slate-500">{marker.district}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        {myPosition && <CurrentLocationMarker position={myPosition} accuracy={state.accuracy} />}
      </MapContainer>
      {locator && <LocateControl state={state} onLocate={locate} />}
    </div>
  )
})