import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  
  console.log('=== CALLBACK DEBUG ===')
  console.log('URL:', request.url)
  console.log('Code present:', !!code)
  console.log('Token hash present:', !!tokenHash)
  console.log('Type:', type)
  console.log('Origin:', origin)
  
  if (code || tokenHash) {
    console.log('Processing auth token...')
    
    try {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )
      
      let authResult
      
      if (code) {
        console.log('Using code for session exchange...')
        authResult = await supabase.auth.exchangeCodeForSession(code)
      } else if (tokenHash && type === 'email') {
        console.log('Using token hash for email verification...')
        authResult = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        })
      }
      
      console.log('Auth result:', {
        hasSession: !!authResult?.data?.session,
        hasUser: !!authResult?.data?.user,
        error: authResult?.error?.message
      })
      
      if (authResult?.error) {
        console.error('Auth error:', authResult.error)
        return NextResponse.redirect(`${origin}/auth/signup?error=auth_failed`)
      }
      
      if (authResult?.data?.session && authResult?.data?.user) {
        console.log('SUCCESS! User authenticated:', authResult.data.user.id)
        console.log('User email verified:', authResult.data.user.email_confirmed_at)
        return NextResponse.redirect(`${origin}/auth/success`)
      } else {
        console.log('No session or user data returned')
        return NextResponse.redirect(`${origin}/auth/signup?error=no_session_data`)
      }
      
    } catch (err) {
      console.error('Callback exception:', err)
      return NextResponse.redirect(`${origin}/auth/signup?error=exception`)
    }
  } else {
    console.log('No code or token_hash parameter found')
    return NextResponse.redirect(`${origin}/auth/signup?error=no_code`)
  }
} 