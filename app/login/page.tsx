'use client'

import { BackgroundPattern } from "@/components/landing/background-pattern"
import { useState, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    const supabase = useMemo(() => createClient(), [])

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault()

        setLoading(true)
        setError(null)

        try {

            // =====================================================
            // 1. Sign In
            // =====================================================

            const {
                data: { user },
                error: loginError,
            } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (loginError) {
                throw loginError
            }

            if (!user) {
                throw new Error('Login failed')
            }

            // =====================================================
            // 2. Fetch User Profile
            // =====================================================

            const {
                data: profile,
                error: profileError,
            } = await supabase
                .from('profiles')
                .select('id, role, bin_id')
                .eq('id', user.id)
                .maybeSingle()

            if (profileError) {
                throw profileError
            }

            // =====================================================
            // 3. Profile Missing
            // =====================================================

            if (!profile) {

                await supabase.auth.signOut()

                throw new Error(
                    'Profile not found. Please contact administrator.'
                )
            }

            // =====================================================
            // 4. Determine Role
            // =====================================================

            const role = profile.role ?? 'user'

            // =====================================================
            // 5. Admin Redirect
            // =====================================================

            if (role === 'admin') {

                router.push('/admin/dashboard')
                router.refresh()
                return
            }

            // =====================================================
            // 6. User Bin Validation
            // =====================================================

            let userBinId = profile.bin_id

            // Fallback -> metadata
            if (!userBinId) {
                userBinId = user.user_metadata?.bin_id
            }

            // Fallback -> bin_access table
            if (!userBinId) {

                const { data: accessRow } = await supabase
                    .from('bin_access')
                    .select('bin_id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .maybeSingle()

                if (accessRow?.bin_id) {
                    userBinId = accessRow.bin_id
                }
            }

            // =====================================================
            // 7. No Bin Linked
            // =====================================================

            if (!userBinId) {

                throw new Error(
                    'No bin linked to this account. Please contact administrator.'
                )
            }

            // =====================================================
            // 8. Verify Bin Exists
            // =====================================================

            const { data: binExists } = await supabase
                .from('r3bin_registry')
                .select('bin_id')
                .ilike('bin_id', userBinId)
                .maybeSingle()

            if (!binExists) {

                throw new Error(
                    'Assigned bin not found in registry.'
                )
            }

            // =====================================================
            // 9. Redirect User
            // =====================================================

            const from = searchParams.get('from')

            if (from) {

                router.push(from)

            } else {

                router.push('/dashboard')
            }

            router.refresh()

        } catch (err: any) {

            console.error(err)

            setError(
                err?.message || 'Something went wrong'
            )

        } finally {

            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {

        setLoading(true)
        setError(null)

        try {

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                throw error
            }

        } catch (err: any) {

            setError(
                err?.message || 'Google login failed'
            )

            setLoading(false)
        }
    }

    return (

        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative">

            <div className="opacity-20">
                <BackgroundPattern />
            </div>

            <Card className="w-full max-w-md bg-[#111111] border-zinc-800 text-white z-10 shadow-2xl">

                <CardHeader>

                    <CardTitle className="text-2xl font-bold text-center">
                        Sign In
                    </CardTitle>

                    <CardDescription className="text-center text-zinc-400">
                        Enter your credentials to access your R3Bin analytics
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >

                        <div className="space-y-2">

                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />

                        </div>

                        <div className="space-y-2">

                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />

                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-950/20 p-2 rounded border border-red-900/50">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-green-700 hover:bg-green-600 text-white transition-colors"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}

                        </Button>

                    </form>

                    <div className="relative my-4">

                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>

                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#111111] px-2 text-zinc-500">
                                Or continue with
                            </span>
                        </div>

                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                        disabled={loading}
                    >

                        {loading ? (

                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                        ) : (

                            <svg
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                                focusable="false"
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 488 512"
                            >
                                <path
                                    fill="currentColor"
                                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                />
                            </svg>

                        )}

                        Login with Google

                    </Button>

                </CardContent>

                <CardFooter className="flex justify-center flex-col gap-2">

                    <p className="text-sm text-zinc-400">

                        Don't have an account?{' '}

                        <Link
                            href="/signup"
                            className="text-green-500 hover:text-green-400 hover:underline font-medium"
                        >
                            Sign Up
                        </Link>

                    </p>

                    <p className="text-xs text-zinc-500 mt-4">

                        <Link
                            href="/"
                            className="hover:text-zinc-300 transition-colors"
                        >
                            ← Back to Home
                        </Link>

                    </p>

                </CardFooter>

            </Card>

        </div>
    )
}