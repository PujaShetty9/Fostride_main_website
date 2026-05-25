
console.log("Supabase object check:", supabase);
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        console.log("Form submitted:", formData);

        try {
            const response = await supabase
                .from("contact_messages")
                .insert([formData]);

            console.log("Supabase raw response:", response); // 🔍 IMPORTANT DEBUG

            if (response.error) {
                console.error("Insert error:", response.error);
                alert("Database error. Check console.");
            } else {
                alert("Message stored successfully!");
                setFormData({ name: "", phone: "", email: "", message: "" });
            }
        } catch (err) {
            console.error("Supabase request crashed:", err);
            alert("Connection to Supabase failed.");
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
            />

            <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
            />

            <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
            </button>
        </form>
    );
}
