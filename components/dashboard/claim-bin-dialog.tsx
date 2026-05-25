
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function ClaimBinDialog({ open, onOpenChange, onBinClaimed }: { open: boolean, onOpenChange: (open: boolean) => void, onBinClaimed: () => void }) {
    const [binId, setBinId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleClaim = async () => {
        if (!binId.trim()) return

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Check if bin exists in registry first
            const { data: registry, error: regError } = await supabase
                .from('r3bin_registry')
                .select('*')
                .eq('bin_id', binId)
                .single()

            if (regError || !registry) {
                throw new Error('Bin ID not found in registry. Please verify the ID.')
            }

            // Try to insert into user_bins table (Best practice)
            const { error: insertError } = await supabase
                .from('user_bins')
                .insert({
                    user_id: user.id,
                    bin_id: binId,
                })

            if (insertError) {
                // Check if it's "relation does not exist" which means user hasn't run the SQL yet
                // If so, we can fallback to just updating metadata for now to "make it work"
                if (insertError.code === '42P01') {
                    console.warn('user_bins table missing, falling back to metadata only')
                }
                else if (insertError.code === '23505') { // Unique constraint violation
                    // Since (user_id, bin_id) is unique, implies user already claimed it.
                    // We can proceed to update metadata just in case.
                } else {
                    // For other errors, maybe we should stop?
                    // But let's try to update metadata anyway to unblock the user.
                    console.error('Error linking bin in table:', insertError)
                }
            }

            // Always update User Metadata (So dashboard can read it directly without table join)
            const { error: userUpdateError } = await supabase.auth.updateUser({
                data: { bin_id: binId }
            })

            if (userUpdateError) {
                throw userUpdateError
            }

            onBinClaimed()
            setBinId('') // Clear input
            onOpenChange(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Connect Your Bin</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Enter the Bin ID found on your R3Bin device to start tracking its data.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="binId" className="text-right text-zinc-300">
                            Bin ID
                        </Label>
                        <Input
                            id="binId"
                            value={binId}
                            onChange={(e) => setBinId(e.target.value)}
                            className="col-span-3 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus:ring-green-600 focus:border-green-600"
                            placeholder="e.g. Bin_001"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center bg-red-950/20 p-2 rounded border border-red-900/50">{error}</p>}
                </div>
                <DialogFooter>
                    {/* We keep the dialog openable/closable but force interaction for first time users if desired */}
                    {/* For now standard buttons */}
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white mr-2">Cancel</Button>
                    <Button onClick={handleClaim} className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Connect Bin'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
