import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) { getUserProfile() }
    else { setLoading(false) }
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await authApi.login(email, password)
      localStorage.setItem('token', data.token)
      setUser(data.data.user)
      return { success: true, user: data.data.user }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await authApi.register(userData)
      localStorage.setItem('token', data.token)
      setUser(data.data.user)
      return { success: true, user: data.data.user }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error al registrar usuario' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const getUserProfile = async () => {
    try {
      const { data } = await authApi.getProfile()
      setUser(data.data.user)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const { data } = await authApi.updateProfile(profileData)
      setUser(data.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error al actualizar perfil' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isOwner: user?.role === 'owner' || user?.role === 'admin',
      login, register, logout, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}
