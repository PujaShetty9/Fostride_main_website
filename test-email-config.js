require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("📧 Testing Email Configuration (Port 587 - Forced Clean)...");

    let user = process.env.GMAIL_USER;
    let pass = process.env.GMAIL_PASS;
    const recipient = process.env.RECIPIENT_EMAIL || user;

    if (!user || !pass) {
        console.error("❌ MISSING ENV VARS!");
        process.exit(1);
    }

    // Clean up potential spaces in password
    pass = pass.replace(/\s/g, '');

    console.log(`User: ${user}`);
    console.log(`Pass length: ${pass.length} (Should be 16)`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        requireTLS: true,
        auth: {
            user: user,
            pass: pass,
        },
        tls: {
            ciphers: 'SSLv3' // Sometimes needed
        }
    });

    console.log("Verifying connection...");
    try {
        await transporter.verify();
        console.log("✅ Server is ready to take our messages");
    } catch (error) {
        console.error("❌ Connection Audit Failed:", error);
        return;
    }

    try {
        console.log("Attempting send...");
        const info = await transporter.sendMail({
            from: `"Test Script" <${user}>`,
            to: recipient,
            subject: "FINAL Test Email - Port 587",
            text: "This confirms outbound SMTP works!",
        });
        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Send Failed:", error);
    }
}

testEmail();
