'use server'

import { cookies, headers } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    throw new Error(
        'ADMIN_USERNAME, ADMIN_PASSWORD e SESSION_SECRET são variáveis obrigatórias. Defina-as no .env'
    )
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SESSION_SECRET = process.env.SESSION_SECRET

// In-memory rate limiter keyed by IP (for production use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const SESSION_MAX_AGE_MS = 30 * 60 * 1000 // 30 minutes

function isRateLimited(ip: string): boolean {
    const record = loginAttempts.get(ip)
    if (!record) return false
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

// Generate a signed session token using HMAC-SHA256
function generateSessionToken(): string {
    const nonce = randomBytes(16).toString('hex')
    const timestamp = Date.now().toString()
    const payload = `${nonce}:${timestamp}`
    const signature = createHmac('sha256', SESSION_SECRET)
        .update(payload)
        .digest('hex')
    return `${payload}:${signature}`
}

// Verify a signed session token using timing-safe comparison
function verifySessionToken(token: string): boolean {
    if (!token) return false
    const parts = token.split(':')
    if (parts.length !== 3) return false

    const [nonce, timestamp, signature] = parts
    const payload = `${nonce}:${timestamp}`
    const expectedSig = createHmac('sha256', SESSION_SECRET)
        .update(payload)
        .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'hex')
    const expBuf = Buffer.from(expectedSig, 'hex')
    if (sigBuf.length !== expBuf.length) return false
    if (!timingSafeEqual(sigBuf, expBuf)) return false

    // Check token age (max 30 minutes)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (isNaN(tokenAge) || tokenAge > SESSION_MAX_AGE_MS) return false

    return true
}

export async function loginAdmin(formData: FormData) {
    const username = (formData.get('username') as string) ?? ''
    const password = (formData.get('password') as string) ?? ''

    // Rate limit by real client IP, not by username
    const headersList = await headers()
    const clientIp = headersList.get('x-forwarded-for')?.split(',')[0].trim()
        ?? headersList.get('x-real-ip')
        ?? 'unknown'

    if (isRateLimited(clientIp)) {
        return {
            success: false,
            error: 'Muitas tentativas. Tente novamente em 15 minutos.'
        }
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        clearAttempts(clientIp)
        const cookieStore = await cookies()
        const token = generateSessionToken()

        cookieStore.set('admin_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: SESSION_MAX_AGE_MS / 1000, // cookie maxAge is in seconds
            path: '/',
        })

        return { success: true }
    }

    recordAttempt(clientIp)
    const record = loginAttempts.get(clientIp)
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
