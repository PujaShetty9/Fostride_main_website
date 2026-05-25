import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, phone, email, message } = await req.json();

    // Validate inputs
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Check environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;
    const recipientEmail = process.env.RECIPIENT_EMAIL;

    if (!gmailUser || !gmailPass || !recipientEmail) {
      const missing = [];
      if (!gmailUser) missing.push('GMAIL_USER');
      if (!gmailPass) missing.push('GMAIL_PASS');
      if (!recipientEmail) missing.push('RECIPIENT_EMAIL');
      
      console.error(`Missing email configuration env vars: ${missing.join(', ')}`);
      return NextResponse.json(
        { error: `Server configuration error. Missing: ${missing.join(', ')}` }, 
        { status: 500 }
      );
    }

    // Create a transporter using Gmail with explicit settings for better compatibility
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s/g, ''), // Remove spaces if present
      },
      tls: {
          ciphers: 'SSLv3'
      }
    });

    // Email content
    const mailOptions = {
        from: `"Fostride Website" <${gmailUser}>`, // Sender address
        to: recipientEmail, // List of receivers
        replyTo: email, // If you reply, it goes to the user who filled the form
        subject: `New Demo Request: ${name}`, // Subject line
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #0C8346; margin-bottom: 20px;">New Demo Request 🚀</h2>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 10px 0;"><strong>👤 Name:</strong> ${name}</p>
                    <p style="margin: 10px 0;"><strong>📞 Phone:</strong> <a href="tel:${phone}" style="color: #0C8346; text-decoration: none;">${phone}</a></p>
                    <p style="margin: 10px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #0C8346; text-decoration: none;">${email}</a></p>
                </div>

                <div style="margin-bottom: 20px;">
                    <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Message:</h3>
                    <p style="white-space: pre-wrap; color: #555; line-height: 1.5;">${message || 'No message provided.'}</p>
                </div>

                <div style="font-size: 12px; color: #888; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
                    This email was sent from your website's contact form.
                </div>
            </div>
        `,
        text: `New Demo Request\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage:\n${message || 'No message provided.'}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message }, 
      { status: 500 }
    );
  }
}
