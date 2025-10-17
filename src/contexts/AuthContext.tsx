import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface PhoneUser {
  id: string
  phone: string
}

interface AuthContextType {
  user: User | null
  phoneUser: PhoneUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  registerWithPhone: (phone: string, password: string) => Promise<{ error: Error | null }>
  signInWithPhone: (phone: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [phoneUser, setPhoneUser] = useState<PhoneUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkPhoneSession = () => {
      const storedPhoneUser = localStorage.getItem('phoneUser')
      if (storedPhoneUser && mounted) {
        setPhoneUser(JSON.parse(storedPhoneUser))
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null)
        checkPhoneSession()
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Auth session error:', error)
      if (mounted) {
        checkPhoneSession()
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const registerWithPhone = async (phone: string, password: string) => {
    try {
      const cleanPhone = phone.trim()
      const cleanPassword = password.trim()

      const { data: existingUser } = await supabase
        .from('phone_users')
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (existingUser) {
        return { error: new Error('Этот номер телефона уже зарегистрирован') }
      }

      const passwordHash = btoa(cleanPassword)

      const { data, error } = await supabase
        .from('phone_users')
        .insert([{ phone: cleanPhone, password_hash: passwordHash }])
        .select('id, phone')
        .single()

      if (error) return { error: new Error('Ошибка регистрации') }

      const phoneUserData = { id: data.id, phone: data.phone }
      localStorage.setItem('phoneUser', JSON.stringify(phoneUserData))
      setPhoneUser(phoneUserData)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithPhone = async (phone: string, password: string) => {
    try {
      const cleanPhone = phone.trim()
      const cleanPassword = password.trim()
      const passwordHash = btoa(cleanPassword)

      const { data, error } = await supabase
        .from('phone_users')
        .select('id, phone, password_hash')
        .eq('phone', cleanPhone)
        .maybeSingle()

      if (error || !data) {
        return { error: new Error('Неверный номер телефона или пароль') }
      }

      if (data.password_hash !== passwordHash) {
        return { error: new Error('Неверный номер телефона или пароль') }
      }

      const phoneUserData = { id: data.id, phone: data.phone }
      localStorage.setItem('phoneUser', JSON.stringify(phoneUserData))
      setPhoneUser(phoneUserData)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('phoneUser')
    setPhoneUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      phoneUser,
      loading,
      signIn,
      signUp,
      registerWithPhone,
      signInWithPhone,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
