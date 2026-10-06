import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, initials } from '../lib/format'
import { Button } from './ui'

const CURRENT_YEAR = new Date().getFullYear()

interface NavItem {
  to: string
  label: string
  staffOnly?: boolean
  adminOnly?: boolean
  citizenOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Ana səhifə' },
  { to: '/categories', label: 'Kateqoriyalar' },
  { to: '/complaints/new', label: 'Şikayət ver', citizenOnly: true },
  { to: '/complaints/mine', label: 'Şikayətlərim', citizenOnly: true },
  { to: '/complaints/mine/map', label: 'Xəritəm', citizenOnly: true },
  { to: '/work', label: 'Təyinatlarım', staffOnly: true },
  { to: '/work/map', label: 'Şəhər xəritəsi', staffOnly: true },
  { to: '/statistics', label: 'Statistika', staffOnly: true },
  { to: '/admin/users', label: 'İstifadəçilər', adminOnly: true },
  { to: '/admin/categories', label: 'Kateqoriya idarəsi', adminOnly: true },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-sm">
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="hidden sm:block">
        <span className="block text-sm font-bold leading-tight text-slate-900">Şəhər Xidmətləri</span>
        <span className="block text-[11px] leading-tight text-slate-500">Şikayət və izləmə portalı</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { user, isStaff, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.staffOnly && !isStaff) return false
    if (item.citizenOnly && isStaff) return false
    return true
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <Logo />

          <nav className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
            {visibleItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
                    {initials(user.fullName, user.username)}
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-semibold text-slate-800">
                      {user.fullName || user.username}
                    </span>
                    <span className="block text-[11px] text-slate-500">{ROLE_LABELS[user.role]}</span>
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.fullName || user.username}
                        </p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Profil
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                      >
                        Çıxış
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Daxil ol
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Qeydiyyat
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Menyu"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={linkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 border-t border-slate-100 pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.fullName || user.username}</p>
                    <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Çıxış
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold ring-1 ring-slate-300"
                  >
                    Daxil ol
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Qeydiyyat
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-3 text-sm text-slate-500">
                Şikayətinizi onlayn verin, hərəkətlərini izləyin və şəhərimizi birlikdə təmizləyək.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="mb-2 font-semibold text-slate-900">Vətəndaş üçün</p>
                <ul className="space-y-1.5 text-slate-500">
                  <li>
                    <Link to="/complaints/new" className="hover:text-brand-700">
                      Şikayət ver
                    </Link>
                  </li>
                  <li>
                    <Link to="/complaints/mine" className="hover:text-brand-700">
                      Şikayətlərim
                    </Link>
                  </li>
                  <li>
                    <Link to="/categories" className="hover:text-brand-700">
                      Kateqoriyalar
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-semibold text-slate-900">İstifadəçi</p>
                <ul className="space-y-1.5 text-slate-500">
                  <li>
                    <Link to="/login" className="hover:text-brand-700">
                      Daxil ol
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-brand-700">
                      Hesab yarat
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-brand-700">
                      Profil
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-400">
            © {CURRENT_YEAR} Şəhər Xidmətləri Portalı · Bakı Şəhər İcra Hakimiyyəti
          </p>
        </div>
      </footer>
    </div>
  )
}