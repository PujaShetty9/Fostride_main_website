'use client'

import { BackgroundPattern } from "@/components/landing/background-pattern"
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function SignupContent() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [binId, setBinId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const errorMsg = searchParams.get('error')
        if (errorMsg) setError(errorMsg)
    }, [searchParams])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match")
            }

            // Verify Bin ID exists
            const { data: bin, error: binError } = await supabase
                .from('r3bin_registry')
                .select('bin_id')
                .ilike('bin_id', binId.trim())
                .maybeSingle()

            if (binError) throw new Error('Error verifying Bin ID')
            if (!bin) throw new Error(`Bin ID "${binId}" not found`)

            const actualBinId = bin.bin_id

            // Create Auth User
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: name,
                        bin_id: actualBinId,
                        company_name: companyName,
                    },
                },
            })

            if (signupError) throw signupError

            if (data.user && data.user.identities && data.user.identities.length === 0) {
                throw new Error('An account with this email already exists.')
            }

            if (!data.user) throw new Error('User creation failed')

            // Insert into profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    full_name: name,
                    email: email,
                    bin_id: actualBinId,
                    role: 'user',
                    company_name: companyName,
                })

            if (profileError) {
                console.error('Profile error:', profileError)
            }

            // Insert into bin_access
            const { error: binAccessError } = await supabase
                .from('bin_access')
                .upsert({
                    user_id: data.user.id,
                    bin_id: actualBinId,
                })

            if (binAccessError) throw binAccessError

            // Update bin_overview with company name and address
            const { error: overviewError } = await supabase
                .from('bin_overview')
                .update({
                    bin_registered_name: companyName,
                })
                .eq('bin_id', actualBinId)

            if (overviewError) {
                console.error('Overview update error:', overviewError)
            }

            setSuccess('Account created successfully! Please check your email to verify your account.')

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
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
                    <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        Create an account to start tracking waste analytics
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company / Organization Name</Label>
                            <Input
                                id="companyName"
                                placeholder="e.g. Somaiya Vidyavihar University"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="binId">Bin ID (from your device)</Label>
                            <Input
                                id="binId"
                                placeholder="e.g. Bin_001"
                                value={binId}
                                onChange={(e) => setBinId(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-green-600 focus:border-green-600"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-950/20 p-2 rounded border border-red-900/50">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-green-500 text-sm text-center bg-green-950/20 p-2 rounded border border-green-900/50">
                                {success}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-green-700 hover:bg-green-600 text-white transition-colors"
                            disabled={loading || !!success}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center flex-col gap-2">
                    <p className="text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-green-500 hover:text-green-400 hover:underline font-medium">
                            Sign In
                        </Link>
                    </p>
                    <p className="text-xs text-zinc-500 mt-4">
                        <Link href="/" className="hover:text-zinc-300 transition-colors">
                            ← Back to Home
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                Loading...
            </div>
        }>
            <SignupContent />
        </Suspense>
    )
}