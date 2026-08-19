import { vi } from 'vitest'

export const useCookie = vi.fn(() => ({
  value: null
}))

export const navigateTo = vi.fn()

export const defineNuxtRouteMiddleware = (fn: any) => fn
