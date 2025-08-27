import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'

export async function GET(request: NextRequest) {
  try {
    const userResponse = await v0.user.get()

    return NextResponse.json({
      id: userResponse.id,
      name: userResponse.name || userResponse.email || 'User',
      email: userResponse.email,
      // Use the correct avatar field name from UserDetail type
      avatarUrl: userResponse.avatar,
    })
  } catch (error) {
    console.error('V0 User API Error:', error)

    // Return a default user if fetch fails
    return NextResponse.json({
      id: 'default',
      name: 'User',
      email: '',
      avatarUrl: undefined,
    })
  }
}
