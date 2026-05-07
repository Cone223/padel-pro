import React, { useState } from 'react'

const SearchFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const facilityOptions = [
    'vestuarios',
    'duchas', 
    'bar',
    'iluminacion',
    'parking',
    'wifi'
  ]

  const courtTypeOptions = [
    'cristal',
    'hormigon',
    'cesped artificial'
  ]

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleFacilityToggle = (facility) => {
    const currentFacilities = localFilters.facilities ? localFilters.facilities.split(',') : []
    const newFacilities = currentFacilities.includes(facility)
      ? currentFacilities.filter(f => f !== facility)
      : [...currentFacilities, facility]
    
    handleChange('facilities', newFacilities.join(','))
  }

  return (
    <div className="card p-6 sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary hover:text-green-700 font-medium"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-6">
        {/* Búsqueda por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Nombre, ciudad..."
            className="input-field"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad
          </label>
          <input
            type="text"
            value={localFilters.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Ej: Buenos Aires"
            className="input-field"
          />
        </div>

        {/* Rango de precios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Precio por Hora
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Mín"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Máx"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Tipo de cancha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cancha
          </label>
          <select
            value={localFilters.courtType || ''}
            onChange={(e) => handleChange('courtType', e.target.value)}
            className="input-field"
          >
            <option value="">Todos los tipos</option>
            {courtTypeOptions.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Instalaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instalaciones
          </label>
          <div className="space-y-2">
            {facilityOptions.map(facility => (
              <label key={facility} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.facilities?.includes(facility) || false}
                  onChange={() => handleFacilityToggle(facility)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {facility}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchFilters