import { useCallback, useState } from 'react'

export interface CurrentLocationState {
  status: 'idle' | 'locating' | 'success' | 'error' | 'unsupported'
  position: { lat: number; lng: number } | null
  accuracy: number | null
  error: string | null
}

type LocateResult = { lat: number; lng: number; accuracy: number } | null

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({
    status: 'idle',
    position: null,
    accuracy: null,
    error: null,
  })

  const locate = useCallback((): Promise<LocateResult> => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        setState((previous) => ({
          ...previous,
          status: 'unsupported',
          error: 'Brauzeriniz yer müəyyənləşdirməyi dəstəkləmir.',
        }))
        resolve(null)
        return
      }

      setState((previous) => ({ ...previous, status: 'locating', error: null }))

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          setState({ status: 'success', position: coords, accuracy: coords.accuracy, error: null })
          resolve(coords)
        },
        () => {
          setState((previous) => ({
            ...previous,
            status: 'error',
            error: 'Mövqeyə daxil olmaq mümkün olmadı.',
          }))
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
      )
    })
  }, [])

  return { ...state, locate }
}