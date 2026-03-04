'use server'

import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ADMIN'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1988'

// Secret used to sign admin session tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'proafiliados-default-secret-change-me'

// In-memory rate limiter (per-process; for production use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
    const record = loginAttempts.get(ip)
    if (!record) return false

    // Reset if lockout period has passed
    if (Date.now() - record.lastAttempt > LOCKOUT_DURATION) {
        loginAttempts.delete(ip)
        return false
    }

    return record.count >= MAX_ATTEMPTS
}

function recordAttempt(ip: string): void {
    const record = loginAttempts.get(ip)
    if (record) {
        record.count += 1
        record.lastAttempt = Date.now()
    } else {
        loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() })
    }
}

function clearAttempts(ip: string): void {
    loginAttempts.delete(ip)
}

// Generate a signed session token
function generateSessionToken(): string {
    const nonce = randomBytes(16).toString('hex')
    const timestamp = Date.now().toString()
    const payload = `${nonce}:${timestamp}`
    const signature = createHash('sha256')
        .update(`${payload}:${SESSION_SECRET}`)
        .digest('hex')
    return `${payload}:${signature}`
}

// Verify a signed session token
function verifySessionToken(token: string): boolean {
    if (!token) return false
    const parts = token.split(':')
    if (parts.length !== 3) return false

    const [nonce, timestamp, signature] = parts
    const expectedSig = createHash('sha256')
        .update(`${nonce}:${timestamp}:${SESSION_SECRET}`)
        .digest('hex')

    if (signature !== expectedSig) return false

    // Check token age (max 2 hours)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 2 * 60 * 60 * 1000) return false

    return true
}

export async function loginAdmin(formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // Simple IP-based identifier (in a real app, use request headers)
    const clientId = `${username}-client`

    // Rate limiting check
    if (isRateLimited(clientId)) {
        return {
            success: false,
            error: 'Muitas tentativas. Tente novamente em 15 minutos.'
        }
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        clearAttempts(clientId)
        const cookieStore = await cookies()
        const token = generateSessionToken()

        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 2, // 2 hours
            path: '/',
        })

        return { success: true }
    }

    recordAttempt(clientId)
    const record = loginAttempts.get(clientId)
    const remaining = MAX_ATTEMPTS - (record?.count || 0)

    return {
        success: false,
        error: remaining > 0
            ? `Credenciais inválidas. ${remaining} tentativa(s) restante(s).`
            : 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
}

export async function logoutAdmin() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    return { success: true }
}

export async function isAdminAuthenticated() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    return token ? verifySessionToken(token) : false
}
