import { NextResponse } from 'next/server'
import { checkRequiredEnvVars } from '@/lib/env-check'

export async function GET() {
  try {
    const missingVars = checkRequiredEnvVars()
    
    // Add debugging information
    const envStatus = {
      V0_API_KEY: process.env.V0_API_KEY ? 'SET' : 'MISSING',
      AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'MISSING', 
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'true' : 'false',
    }
    
    console.log('Environment variable status:', envStatus)
    console.log('Missing variables detected:', missingVars.map(v => v.name))
    
    return NextResponse.json({
      missingVars,
      hasAllRequired: missingVars.length === 0,
      debug: {
        envStatus,
        timestamp: new Date().toISOString(),
        platform: process.env.VERCEL ? 'vercel' : 'other'
      }
    })
  } catch (error) {
    console.error('Error checking environment variables:', error)
    
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    )
  }
}
