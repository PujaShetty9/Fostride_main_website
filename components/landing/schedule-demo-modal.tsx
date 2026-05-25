"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2 } from "lucide-react"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupInput,
} from "@/components/ui/input-group"
import { supabase } from "@/lib/supabaseClient"

interface ScheduleDemoModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ScheduleDemoModal({ open, onOpenChange }: ScheduleDemoModalProps) {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        message: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        console.log("🔵 Form submission started")
        console.log("📝 Form data:", formData)

        try {
            // Call the PostgreSQL function to insert data
            // This bypasses RLS while maintaining security
            console.log("📤 Calling insert_contact_message function...")

            const { data, error } = await supabase
                .rpc('insert_contact_message', {
                    p_name: formData.name,
                    p_phone: formData.phone,
                    p_email: formData.email,
                    p_message: formData.message || ""
                })

            console.log("📥 Function response received")

            if (error) {
                console.error("🚨 Function call error:", error)
                console.error("Error details:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })

                alert(`Error: ${error.message}`)
                setLoading(false)
                return
            }

            console.log("✅ Form submitted successfully:", data)

            // Send email notification
            console.log("📧 Sending email notification...")
            try {
                const emailResponse = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })

                if (emailResponse.ok) {
                    console.log("✅ Email sent successfully")
                } else {
                    console.error("❌ Failed to send email:", await emailResponse.text())
                }
            } catch (emailError) {
                console.error("❌ Error sending email:", emailError)
                // Don't fail the submission if email fails, just log it
            }

            setLoading(false)
            setSubmitted(true)

            // Reset form after successful submission
            setFormData({ name: "", phone: "", email: "", message: "" })
        } catch (err) {
            console.error("💥 Unexpected error:", err)
            alert("Failed to submit form. Please check your connection and try again.")
            setLoading(false)
        }
    }

    const resetForm = () => {
        setSubmitted(false)
        setFormData({ name: "", phone: "", email: "", message: "" })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {submitted ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle>Request Received!</DialogTitle>
                            <DialogDescription>
                                Thanks for your interest. Our team will contact you shortly to schedule your demo.
                            </DialogDescription>
                        </div>
                        <Button onClick={resetForm} className="mt-4">
                            Close
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Schedule a Demo</DialogTitle>
                            <DialogDescription>
                                Fill out the form below and we'll get back to you within 24 hours.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <InputGroup>
                                    <InputGroupAddon className="bg-muted/50 border-r">
                                        <InputGroupText>🇮🇳 +91</InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        id="phone"
                                        type="tel"
                                        placeholder="98765 43210"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </InputGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@company.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us about your needs..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
