
import axios from 'axios'
import { getSession } from 'next-auth/react'

// Browser requests go through the Next.js rewrite proxy (relative path avoids CORS);
// server-side requests (Server Components) need an absolute URL since there's no page origin.
const baseURL = typeof window === 'undefined'
  ? (process.env.INTERNAL_API_URL ?? 'http://localhost:3001')
  : '/api/proxy'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT token to every request (browser only — server components pass their own Authorization header)
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession()
      if (session) {
        config.headers.Authorization = `Bearer ${(session as any).accessToken}`
      }
    } catch {
      // Transient auth session fetch failure, proceed without auth header
    }
  }
  return config
})

const CDN_HOST = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '') || 'https://d39qo2zc9y9x7i.cloudfront.net'

function replaceS3Urls(data: any): any {
  if (!data) return data
  if (typeof data === 'string') {
    if (data.includes('.s3.') || data.includes('.amazonaws.com/')) {
      try {
        const u = new URL(data)
        return `${CDN_HOST}${u.pathname}`
      } catch {
        return data
      }
    }
    return data
  }
  if (Array.isArray(data)) {
    return data.map(replaceS3Urls)
  }
  if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      data[key] = replaceS3Urls(data[key])
    }
    return data
  }
  return data
}

// Unwrap { success: true, data: {...} } from every response
api.interceptors.response.use(
  (response) => {
    if (response.data?.success && response.data?.data !== undefined) {
      response.data = response.data.data
    }
    response.data = replaceS3Urls(response.data)
    return response
  },
  (error) => {
    // Unwrap error message from backend too
    const message = error?.response?.data?.message
    if (message) {
      error.message = Array.isArray(message) ? message.join(', ') : message
    }
    return Promise.reject(error)
  }
)