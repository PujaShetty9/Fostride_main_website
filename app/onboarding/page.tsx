'use client'

import { BackgroundPattern } from "@/components/landing/background-pattern"
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Recycle } from 'lucide-react'

function OnboardingContent() {
  const [binId, setBinId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // ── Check if user actually needs onboarding ──────────────────────────────
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('bin_id, full_name, role')
        .eq('id', user.id)
        .single()

      // If bin already set, go to dashboard
      if (profile?.bin_id) {
        router.push(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard')
        return
      }

      setUserName(
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        'there'
      )
      setChecking(false)
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify Bin ID exists
      const { data: bin, error: binError } = await supabase
        .from('r3bin_registry')
        .select('bin_id')
        .ilike('bin_id', binId.trim())
        .maybeSingle()

      if (binError) throw new Error('Error verifying Bin ID')
      if (!bin) throw new Error(`Bin ID "${binId}" not found`)

      const actualBinId = bin.bin_id

      // Update profile with bin_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ bin_id: actualBinId })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Insert into bin_access
      const { error: accessError } = await supabase
        .from('bin_access')
        .upsert({
          user_id: user.id,
          bin_id: actualBinId,
        })

      if (accessError) throw accessError

      // Update bin_overview
      const { error: overviewError } = await supabase
        .from('bin_overview')
        .update({
          bin_registered_name: companyName,
        })
        .eq('bin_id', actualBinId)

      if (overviewError) {
        console.error('Overview update error:', overviewError)
      }

      router.push('/dashboard')

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Recycle className="h-8 w-8 text-[#0C8346] animate-spin" />
        <p className="text-sm text-zinc-500">Setting up your account...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative">
      <div className="opacity-20">
        <BackgroundPattern />
      </div>

      <Card className="w-full max-w-md bg-[#111111] border-zinc-800 text-white z-10 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-[#0C8346] flex items-center justify-center">
              <Recycle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            One Last Step!
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Hi {userName}! Link your R3Bin device to complete setup.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

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
                  Setting up...
                </>
              ) : (
                'Complete Setup →'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-zinc-500">
            You can only link one bin per account
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#0C8346]" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}