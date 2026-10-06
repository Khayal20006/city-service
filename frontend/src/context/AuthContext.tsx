import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, setToken, getToken } from '../lib/api'
import type { AuthResponse, LoginInput, RegisterInput, User } from '../lib/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isStaff: boolean
  isAdmin: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STAFF_ROLES = ['ADMIN', 'DEPARTMENT_MANAGER', 'FIELD_EMPLOYEE']

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start in the loading state only when a token is actually waiting to be validated.
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => getToken() !== null)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get<User>('/api/users/me')
      setUser(data)
    } catch {
      // The interceptor already cleared the token on 401.
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (getToken()) {
      void refresh()
    }
  }, [refresh])

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', input)
    setToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', input)
    setToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isStaff: user !== null && STAFF_ROLES.includes(user.role),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refresh,
    }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth yalnız AuthProvider daxilində istifadə oluna bilər')
  }
  return context
}