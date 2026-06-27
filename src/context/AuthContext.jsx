import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, isAuthenticated, setAuthToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (!isAuthenticated()) {
        setLoading(false)
        return
      }
      try {
        const me = await api.me()
        setUser(me)
      } catch {
        setAuthToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      async login(email, password) {
        const { access_token } = await api.login({ email, password })
        setAuthToken(access_token)
        const me = await api.me()
        setUser(me)
        return me
      },
      async register(full_name, email, password) {
        await api.register({ full_name, email, password })
        const { access_token } = await api.login({ email, password })
        setAuthToken(access_token)
        const me = await api.me()
        setUser(me)
        return me
      },
      logout() {
        setAuthToken(null)
        setUser(null)
      },
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
