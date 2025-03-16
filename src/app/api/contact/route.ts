import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Configure email transporter
    // For production, use your actual SMTP configuration
    // For development/testing, you can use services like Mailtrap, SendGrid, etc.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Admin email to receive contacts
        pass: process.env.EMAIL_PASSWORD || 'your-email-password' // Password or app-specific password
      }
    });

    // Email content
    const mailOptions = {
      from: `"Exclusive E-commerce Contact" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: process.env.ADMIN_EMAIL || 'admin@exclusive.com', // Admin's email address
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      // Include a text version for email clients that don't support HTML
      text: `
        New Contact Form Submission
        --------------------------
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again later.' },
      { status: 500 }
    );
  }
} 