import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465, // sau 587 pentru TLS
  secure: true, // true pentru portul 465, false pentru 587
  auth: {
    user: "contact@ydestiny.com",
    pass: "Timewatch132021!",
  },
});

// Email templates
const getEmailTemplate = (type, data, language = 'en') => {
  const translations = {
    en: {
      welcomeSubject: 'Welcome to YDestiny - Your Cosmic Journey Begins!',
      welcomeTitle: 'Welcome to YDestiny!',
      welcomeMessage: 'Your account has been successfully created. Start exploring your cosmic connections and find your perfect match through astrological compatibility.',
      exploreButton: 'Explore YDestiny',
      contactSubject: 'New Contact Form Submission',
      contactTitle: 'New Contact Message',
      footer: 'Best regards,<br>The YDestiny Team'
    },
    ro: {
      welcomeSubject: 'Bun venit la YDestiny - Călătoria Ta Cosmică Începe!',
      welcomeTitle: 'Bun venit la YDestiny!',
      welcomeMessage: 'Contul tău a fost creat cu succes. Începe să explorezi conexiunile tale cosmice și găsește-ți perechea perfectă prin compatibilitatea astrologică.',
      exploreButton: 'Explorează YDestiny',
      contactSubject: 'Nouă Mesaj de Contact',
      contactTitle: 'Mesaj Nou de Contact',
      footer: 'Cu stimă,<br>Echipa YDestiny'
    }
  };

  const t = translations[language] || translations.en;

  const baseStyle = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8f9fa; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #722ed1, #FFB84D); padding: 40px 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
      .content { padding: 40px; }
      .content p { line-height: 1.6; color: #333; margin-bottom: 20px; }
      .button { display: inline-block; background: linear-gradient(135deg, #722ed1, #FFB84D); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-top: 1px solid #e9ecef; }
      .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
  `;

  switch (type) {
    case 'welcome':
      return {
        subject: t.welcomeSubject,
        html: `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>${t.welcomeTitle}</h1>
            </div>
            <div class="content">
              <p>Hello ${data.name || 'there'},</p>
              <p>${t.welcomeMessage}</p>
              <div style="text-align: center;">
                <a href="${data.appUrl || 'https://ydestiny.com'}" class="button">${t.exploreButton}</a>
              </div>
              <p>We're excited to have you on board!</p>
            </div>
            <div class="footer">
              <p>${t.footer}</p>
            </div>
          </div>
        `
      };

    case 'contact':
      return {
        subject: `${t.contactSubject} - ${data.subject || 'No Subject'}`,
        html: `
          ${baseStyle}
          <div class="container">
            <div class="header">
              <h1>${t.contactTitle}</h1>
            </div>
            <div class="content">
              <div class="contact-info">
                <p><strong>From:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
              </div>
              <p><strong>Message:</strong></p>
              <p>${data.message}</p>
            </div>
            <div class="footer">
              <p>Sent from YDestiny Contact Form</p>
            </div>
          </div>
        `
      };

    default:
      throw new Error('Invalid email type');
  }
};

export async function POST(request) {
  try {
    const { type, to, data, language = 'en' } = await request.json();

    if (!type || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const template = getEmailTemplate(type, data, language);

    const mailOptions = {
      from: '"YDestiny" <contact@ydestiny.com>',
      to: type === 'contact' ? 'contact@ydestiny.com' : to,
      subject: template.subject,
      html: template.html,
    };

    // For contact form, also send a copy to the sender
    if (type === 'contact') {
      mailOptions.replyTo = to;
    }

    const info = await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error.message 
    }, { status: 500 });
  }
} 