import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-green group-hover:shadow-green-lg transition-all">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
      </svg>
    </div>
    <span className="font-bold text-white text-lg tracking-tight">
      Padel<span className="text-brand-400">Finder</span>
    </span>
  </Link>
)

const NavItem = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`
  }>
    {children}
  </NavLink>
)

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            <NavItem to="/">Inicio</NavItem>
            <NavItem to="/canchas">Canchas</NavItem>
            <NavItem to="/torneos">Torneos</NavItem>
            {isAdmin && <NavItem to="/admin">Admin</NavItem>}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-dark-700 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <span className="text-brand-400 text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-dark-200 group-hover:text-white">{user?.name?.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-dark-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-dark-600">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-dark-300 mt-0.5">{user?.email}</p>
                      <span className={`mt-1.5 badge ${user?.role === 'admin' ? 'badge-green' : 'badge-gray'}`}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="p-1">
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-dark-200 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
                        <span>📊</span> Mi Panel
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors">
                          <span>⚡</span> Panel Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors mt-1">
                        <span>→</span> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-dark-200 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block w-full h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}/>
              <span className={`block w-full h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`}/>
              <span className={`block w-full h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}/>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-700 bg-dark-800 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {[['/', 'Inicio'], ['/canchas', 'Canchas'], ['/torneos', 'Torneos']].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-dark-200 hover:text-white hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors">{label}</Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-brand-400 hover:bg-brand-500/10 rounded-lg text-sm font-medium transition-colors">⚡ Admin</Link>}
          </div>
          <div className="border-t border-dark-700 px-4 py-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-secondary justify-center">Mi Panel</Link>
                <button onClick={handleLogout} className="btn-danger justify-center">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary justify-center">Iniciar sesión</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary justify-center">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
