import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const StatItem = ({ number, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-gradient">{number}</div>
    <div className="text-dark-300 text-sm mt-1">{label}</div>
  </div>
)

const FeatureCard = ({ icon, title, desc, to, tag }) => (
  <Link to={to} className="card-hover group p-6 flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-2xl">
        {icon}
      </div>
      {tag && <span className="badge-green">{tag}</span>}
    </div>
    <div>
      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-brand-400 transition-colors">{title}</h3>
      <p className="text-dark-300 text-sm leading-relaxed">{desc}</p>
    </div>
    <div className="flex items-center gap-1 text-brand-400 text-sm font-medium mt-auto">
      Explorar <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
    </div>
  </Link>
)

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-green pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            La plataforma líder de pádel en Argentina
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Gestioná tu pádel
            <br />
            <span className="text-gradient">como un profesional</span>
          </h1>
          
          <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Reservá canchas, organizá torneos y seguí tu progreso en una sola plataforma. 
            Diseñada para jugadores y clubes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            {isAuthenticated ? (
              <Link to="/canchas" className="btn-primary text-base px-8 py-3">
                Reservar una cancha
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-green">
                  Empezar gratis
                </Link>
                <Link to="/canchas" className="btn-secondary text-base px-8 py-3">
                  Ver canchas
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-dark-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="50+" label="Clubs activos" />
            <StatItem number="200+" label="Canchas disponibles" />
            <StatItem number="15k+" label="Reservas por mes" />
            <StatItem number="98%" label="Satisfacción" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">Todo lo que necesitás</h2>
            <p className="text-dark-300 max-w-xl mx-auto">Una plataforma completa para jugadores y administradores de clubes de pádel.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎾"
              title="Reserva de Canchas"
              desc="Encontrá y reservá canchas disponibles en tiempo real. Calendario visual con horarios y precios."
              to="/canchas"
              tag="Popular"
            />
            <FeatureCard
              icon="🏆"
              title="Torneos"
              desc="Inscribite en torneos locales y competí con otros jugadores. Rankings actualizados."
              to="/torneos"
            />
            <FeatureCard
              icon="📊"
              title="Tu Panel"
              desc="Seguí tus reservas, historial de torneos y estadísticas personales en tu dashboard."
              to="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-4">¿Cómo funciona?</h2>
            <p className="text-dark-300">Simple, rápido y confiable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Creá tu cuenta', desc: 'Registrate en segundos. Gratis para siempre para usuarios.' },
              { step: '02', title: 'Elegí tu cancha', desc: 'Buscá canchas por zona, precio o tipo. Mirá disponibilidad en tiempo real.' },
              { step: '03', title: 'Reservá y jugá', desc: 'Confirmá tu turno al instante y recibí recordatorio. Sin complicaciones.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-start gap-4">
                <span className="text-5xl font-bold text-brand-500/20">{step}</span>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card p-12 bg-gradient-to-br from-dark-800 to-dark-700 border-brand-500/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-glow-green opacity-50 pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Listo para empezar?
                </h2>
                <p className="text-dark-300 mb-8 text-lg">
                  Unite a miles de jugadores que ya gestionan su pádel con PadelFinder.
                </p>
                <Link to="/register" className="btn-primary text-base px-10 py-3 shadow-green-lg">
                  Crear cuenta gratis →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-dark-700 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-bold text-white">Padel<span className="text-brand-400">Finder</span></span>
          </div>
          <p className="text-dark-400 text-sm">© 2024 PadelFinder. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/canchas" className="text-dark-400 hover:text-white text-sm transition-colors">Canchas</Link>
            <Link to="/torneos" className="text-dark-400 hover:text-white text-sm transition-colors">Torneos</Link>
            <Link to="/register" className="text-dark-400 hover:text-white text-sm transition-colors">Registro</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
