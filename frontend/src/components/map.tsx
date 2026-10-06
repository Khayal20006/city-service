import { memo, useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { BAKU_CENTER } from '../lib/format'
import type { ComplaintStatus, Priority } from '../lib/types'
import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/format'

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

/** Click-to-pick map used when filing a complaint. */
export function LocationPicker({
  value,
  onChange,
  className = 'h-96',
}: {
  value: { lat: number; lng: number } | null
  onChange: (position: [number, number]) => void
  className?: string
}) {
  const position: [number, number] = value ? [value.lat, value.lng] : BAKU_CENTER

  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}>
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
      </MapContainer>
    </div>
  )
}

/** Read-only map with complaint markers. Canvas rendering keeps hundreds of pins smooth. */
export const MarkerMap = memo(function MarkerMap({
  markers,
  focus,
  className = 'h-96',
}: {
  markers: MarkerData[]
  focus?: [number, number] | null
  className?: string
}) {
  const center: [number, number] = focus ??
    (markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : BAKU_CENTER)

  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}>
      <MapContainer center={center} zoom={12} scrollWheelZoom preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
      </MapContainer>
    </div>
  )
})