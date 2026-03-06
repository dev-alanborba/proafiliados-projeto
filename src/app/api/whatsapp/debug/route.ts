import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        hasUrl: !!process.env.EVOLUTION_API_URL,
        urlLength: process.env.EVOLUTION_API_URL?.length || 0,
        hasKey: !!process.env.EVOLUTION_API_KEY,
        keyLength: process.env.EVOLUTION_API_KEY?.length || 0,
        url: process.env.EVOLUTION_API_URL,
    })
}
