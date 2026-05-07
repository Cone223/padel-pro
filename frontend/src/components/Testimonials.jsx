import React from 'react'

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Martín Rodríguez",
      role: "Dueño - Club Norte",
      content: "PadelFinder revolucionó la gestión de mi club. Las reservas se triplicaron en el primer mes.",
      avatar: "👨‍💼"
    },
    {
      id: 2,
      name: "Ana López",
      role: "Administradora - Club Premium",
      content: "El dashboard me permite controlar todo el negocio desde el celular. ¡Increíble!",
      avatar: "👩‍💼"
    },
    {
      id: 3,
      name: "Carlos Méndez",
      role: "Fundador - Club Centro",
      content: "La plataforma es intuitiva y el soporte responde en minutos. 100% recomendado.",
      avatar: "🧔‍♂️"
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
            Lo que dicen nuestros clubs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre cómo PadelFinder está transformando la gestión de canchas de pádel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card p-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.content}"</p>
              <div className="flex text-yellow-400 mt-4">
                {"★".repeat(5)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials