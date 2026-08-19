import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie, navigateTo } from '#app'

export interface UserSession {
  nama: string
  role: string
  email?: string
  level_id?: string
}

export interface AuthSession {
  isLoggedIn: boolean
  user: UserSession | null
  token?: string
}

export const useAuthStore = defineStore('auth', () => {
  const authCookie = useCookie<AuthSession | null>('auth-session', {
    maxAge: 60 * 60 * 24 // 24 hours
  })

  const isLoggedIn = ref(authCookie.value?.isLoggedIn ?? false)
  const user = ref<UserSession | null>(authCookie.value?.user ?? null)
  const token = ref<string | null>(authCookie.value?.token ?? null)
  const errorMessage = ref('')
  const message = ref('')
  const isError = ref(false)

  const dummyUsers = [
    { username: 'admin@pln.co.id', password: 'admin123', nama: 'Admin PLN', role: 'Admin', level_id: '1' },
    { username: 'admin', password: 'admin123', nama: 'Admin PLN', role: 'Admin', level_id: '1' },
    { username: 'operator@pln.co.id', password: 'operator123', nama: 'Operator Lapangan', role: 'Operator', level_id: '2' },
    { username: 'operator', password: 'operator123', nama: 'Operator Lapangan', role: 'Operator', level_id: '2' }
  ]

  const setSession = (sessionUser: UserSession, sessionToken: string = 'token_dummy_123') => {
    isLoggedIn.value = true
    user.value = sessionUser
    token.value = sessionToken

    authCookie.value = {
      isLoggedIn: true,
      user: sessionUser,
      token: sessionToken
    }

    if (import.meta.client) {
      localStorage.setItem('token', sessionToken)
      localStorage.setItem('user', JSON.stringify(sessionUser))
    }
  }

  const login = (usernameInput: string, passwordInput: string): boolean => {
    const found = dummyUsers.find(
      u => u.username === usernameInput && u.password === passwordInput
    )

    if (found) {
      setSession({
        nama: found.nama,
        role: found.role,
        email: found.username,
        level_id: found.level_id
      })
      return true
    }

    return false
  }

  const setError = (errorState: boolean) => {
    isError.value = errorState
  }

  const setMessage = (msg: string) => {
    message.value = msg
  }

  const logout = () => {
    isLoggedIn.value = false
    user.value = null
    token.value = null
    authCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    navigateTo('/login')
  }

  return {
    isLoggedIn,
    user,
    token,
    errorMessage,
    message,
    isError,
    setSession,
    login,
    setError,
    setMessage,
    logout
  }
})
