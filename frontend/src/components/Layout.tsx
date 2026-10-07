import { useEffect, useState } from 'react'
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
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="display block text-lg leading-none text-ink">
        Şəhər <em className="font-medium text-brand-600">Xidmətləri</em>
      </span>
    </Link>
  )
}

export default function Layout() {
  const { user, isStaff, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    `link-underline rounded-md px-3 py-2 text-[13px] font-medium tracking-tight transition ${
      isActive
        ? 'text-ink is-active'
        : 'text-ink/60 hover:text-ink'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`sticky top-0 z-40 bg-paper/90 backdrop-blur-md transition-shadow ${
          scrolled ? 'shadow-[0_1px_0_rgb(34_29_22/0.1),0_16px_32px_-28px_rgb(34_29_22/0.35)]' : ''
        }`}
      >
        <div className="border-b border-ink/8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/40">
              Bakı Şəhər İcra Hakimiyyəti
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/40 md:inline">
              Bazar – Cümə · 09:00 – 18:00
            </span>
            <a
              href="mailto:destek@city.gov.az"
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-700 transition hover:text-brand-800"
            >
              destek@city.gov.az
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Logo />

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {visibleItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 ring-1 ring-ink/10 transition hover:ring-ink/25"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-parchment">
                    {initials(user.fullName, user.username)}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block text-xs font-semibold text-ink">
                      {user.fullName || user.username}
                    </span>
                    <span className="block text-[10px] text-ink/50">{ROLE_LABELS[user.role]}</span>
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-ink/10 bg-parchment shadow-lift">
                      <div className="border-b border-ink/8 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-ink">
                          {user.fullName || user.username}
                        </p>
                        <p className="truncate text-xs text-ink/50">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-ink/75 hover:bg-ink/5"
                      >
                        Profil
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-rose-700 hover:bg-rose-50"
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
                  className="rounded-full px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                >
                  Daxil ol
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-parchment shadow-[0_10px_24px_-14px_rgb(34_29_22/0.6)] transition hover:bg-brand-700"
                >
                  Qeydiyyat
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-ink/60 transition hover:bg-ink/5 lg:hidden"
              aria-label="Menyu"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6">
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
          <div className="border-t border-ink/8 bg-paper px-4 py-3 lg:hidden">
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
            <div className="mt-3 border-t border-ink/8 pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{user.fullName || user.username}</p>
                    <p className="text-xs text-ink/50">{ROLE_LABELS[user.role]}</p>
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
                    className="flex-1 rounded-full bg-parchment px-4 py-2 text-center text-sm font-semibold text-ink ring-1 ring-ink/15"
                  >
                    Daxil ol
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-parchment"
                  >
                    Qeydiyyat
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>

      <footer className="relative mt-14 overflow-hidden bg-ink text-slate-300">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-baseline gap-4 border-b border-white/10 pb-8">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-300">
              ( Bakı )
            </p>
            <p className="display text-4xl leading-none text-white sm:text-6xl">
              Şəhər <em className="font-medium text-brand-400">Xidmətləri</em>
            </p>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-10 pt-10">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <span className="text-brand-400">•</span>
                <span className="display block text-lg text-white">
                  Bir şikayət · bir həll
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Şikayətinizi onlayn verin, hərəkətlərini izləyin və Bakını birlikdə daha yaxşı edək.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 text-sm">
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Vətəndaş üçün
                </p>
                <ul className="space-y-2.5 text-slate-400">
                  <li>
                    <Link to="/complaints/new" className="transition hover:text-white">
                      Şikayət ver
                    </Link>
                  </li>
                  <li>
                    <Link to="/complaints/mine" className="transition hover:text-white">
                      Şikayətlərim
                    </Link>
                  </li>
                  <li>
                    <Link to="/categories" className="transition hover:text-white">
                      Kateqoriyalar
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  İstifadəçi
                </p>
                <ul className="space-y-2.5 text-slate-400">
                  <li>
                    <Link to="/login" className="transition hover:text-white">
                      Daxil ol
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="transition hover:text-white">
                      Hesab yarat
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="transition hover:text-white">
                      Profil
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
            © {CURRENT_YEAR} Şəhər Xidmətləri Portalı · Bakı Şəhər İcra Hakimiyyəti
          </p>
        </div>
      </footer>
    </div>
  )
}