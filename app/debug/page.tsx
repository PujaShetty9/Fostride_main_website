
'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function DebugPage() {
    const supabase = createClient()
    const [config, setConfig] = useState<any>({})
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkConnection = async () => {
            // 1. Get Config (Client Side)
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL
            const projectRef = url?.split('//')[1]?.split('.')[0]

            // 2. Get Session
            const { data: { session } } = await supabase.auth.getSession()

            setConfig({
                url,
                projectRef,
                keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
            })
            setSession(session)
            setLoading(false)
        }

        checkConnection()
    }, [])

    return (
        <div className="p-8 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-6 text-green-500">Supabase Connection Debugger</h1>

            <div className="space-y-6">
                <section className="border border-zinc-800 p-4 rounded bg-zinc-900">
                    <h2 className="text-xl mb-2 text-blue-400">1. Project Configuration</h2>
                    <p className="text-zinc-400 text-sm mb-4">
                        Check that these match your Supabase Dashboard exactly.
                    </p>
                    <div className="grid grid-cols-[150px_1fr] gap-2">
                        <div className="text-zinc-500">Supabase URL:</div>
                        <div>{config.url}</div>

                        <div className="text-zinc-500">Project Ref ID:</div>
                        <div className="font-bold text-yellow-400 text-lg">
                            {config.projectRef || 'Not Found'}
                        </div>

                        <div className="text-zinc-500">Key Status:</div>
                        <div>{config.keyLength > 0 ? '✅ Present' : '❌ Missing'}</div>
                    </div>
                </section>

                <section className="border border-zinc-800 p-4 rounded bg-zinc-900">
                    <h2 className="text-xl mb-2 text-blue-400">2. Current Session</h2>
                    {loading ? (
                        <div>Loading session...</div>
                    ) : session ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                <span className="font-bold">Authenticated</span>
                            </div>
                            <div className="grid grid-cols-[150px_1fr] gap-2 mt-4">
                                <div className="text-zinc-500">User Email:</div>
                                <div>{session.user.email}</div>

                                <div className="text-zinc-500">User ID (UID):</div>
                                <div className="font-mono bg-zinc-950 p-1 px-2 rounded">
                                    {session.user.id}
                                </div>

                                <div className="text-zinc-500">Bin ID (Meta):</div>
                                <div>{session.user.user_metadata?.bin_id || 'None'}</div>
                            </div>

                            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded text-sm">
                                <strong>Instructions:</strong><br />
                                1. Copy the <strong>Project Ref ID</strong> above: <span className="bg-zinc-800 px-1">{config.projectRef}</span><br />
                                2. Go to your Supabase Dashboard.<br />
                                3. Look at the URL in your browser address bar.<br />
                                4. Does it start with <code>https://supabase.com/dashboard/project/{config.projectRef}</code>?<br />
                                <br />
                                <strong>If the IDs are different:</strong> You are looking at the wrong project.<br />
                                <strong>If they match:</strong> Go to Authentication {'>'} Users and search for <code>{session.user.id}</code>.
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-yellow-500">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span>Not currently logged in. Please log in first.</span>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
