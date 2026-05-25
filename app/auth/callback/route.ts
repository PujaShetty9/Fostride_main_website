import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {}
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Check if profile exists
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id, role')
                    .eq('id', user.id)
                    .single()

                if (!existingProfile) {
                    // Profile missing — create it now from metadata
                    // Works for both email signup and Google OAuth
                    const fullName = user.user_metadata?.full_name
                        ?? user.user_metadata?.name
                        ?? ''
                    const binId = user.user_metadata?.bin_id ?? null

                    await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: fullName,
                        email: user.email ?? '',
                        bin_id: binId,
                        role: 'user',
                    })

                    // Also create bin_access if bin_id exists
                    if (binId) {
                        await supabase.from('bin_access').upsert({
                            user_id: user.id,
                            bin_id: binId,
                        })
                    }
                }

                // Fetch role for redirect
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                const role = profile?.role ?? 'user'
                const redirectTo = role === 'admin'
                    ? '/admin/dashboard'
                    : '/dashboard'

                const forwardedHost = request.headers.get('x-forwarded-host')
                const isLocalEnv = process.env.NODE_ENV === 'development'

                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}${redirectTo}`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`)
                } else {
                    return NextResponse.redirect(`${origin}${redirectTo}`)
                }
            }
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`)
}