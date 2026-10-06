import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from './types'

const TOKEN_KEY = 'city-service.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/** Thrown for every failed request so callers only deal with one error shape. */
export class ApiError extends Error {
  readonly status: number
  readonly details: string[]

  constructor(message: string, status: number, details: string[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * In development the Vite proxy forwards /api to Spring Boot, so an empty base URL keeps the
 * browser on a single origin. Set VITE_API_BASE_URL when the API lives somewhere else.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data

    if (status === 401) {
      // The token expired or was revoked: drop it and bounce to the login screen.
      setToken(null)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
      return Promise.reject(new ApiError('Sessi sona çatdı. Yenidən daxil olun.', status))
    }

    if (body?.message) {
      return Promise.reject(new ApiError(body.message, status, body.details ?? []))
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new ApiError('Serverə qoşulma mümkün deyil.', 0))
    }

    return Promise.reject(new ApiError('Gözənilməz xəta baş verdi.', status || 500))
  },
)