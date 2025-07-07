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

    case 'error_report':
      const errorData = data.errorData || {};
      const severityColors = {
        low: '#52c41a',
        medium: '#faad14',
        high: '#ff7a45',
        critical: '#ff4d4f',
        user_reported: '#722ed1'
      };
      const severityColor = severityColors[errorData.severity] || '#666';
      
      return {
        subject: `🚨 YDestiny Error Report - ${errorData.severity?.toUpperCase() || 'UNKNOWN'} [${data.errorId}]`,
        html: `
          ${baseStyle}
          <style>
            .error-header { background: linear-gradient(135deg, #ff4d4f, #ff7a45); }
            .error-badge { 
              display: inline-block; 
              background: ${severityColor}; 
              color: white; 
              padding: 4px 12px; 
              border-radius: 12px; 
              font-size: 12px; 
              font-weight: 600; 
              text-transform: uppercase;
            }
            .error-section { 
              background: #f8f9fa; 
              padding: 16px; 
              border-radius: 8px; 
              margin: 16px 0; 
              border-left: 4px solid ${severityColor};
            }
            .error-code { 
              background: #1f1f1f; 
              color: #f8f8f2; 
              padding: 12px; 
              border-radius: 6px; 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              overflow-x: auto; 
              white-space: pre-wrap;
            }
            .user-message { 
              background: #e6f7ff; 
              border: 1px solid #91d5ff; 
              padding: 12px; 
              border-radius: 6px; 
              font-style: italic;
            }
          </style>
          <div class="container">
            <div class="header error-header">
              <h1>🚨 Error Report - YDestiny App</h1>
              <div style="margin-top: 12px;">
                <span class="error-badge">${errorData.severity || 'unknown'} severity</span>
              </div>
            </div>
            <div class="content">
              <div class="error-section">
                <h3>📊 Error Overview</h3>
                <p><strong>Error ID:</strong> ${data.errorId}</p>
                <p><strong>Type:</strong> ${errorData.type || 'Unknown'}</p>
                <p><strong>Context:</strong> ${errorData.context || 'Unknown'}</p>
                <p><strong>Timestamp:</strong> ${errorData.timestamp || new Date().toISOString()}</p>
                <p><strong>Environment:</strong> ${errorData.environment || 'Unknown'}</p>
                <p><strong>App Version:</strong> ${errorData.appVersion || 'Unknown'}</p>
              </div>

              ${errorData.userEmail ? `
              <div class="error-section">
                <h3>👤 User Information</h3>
                <p><strong>User:</strong> ${errorData.userName || 'Unknown'}</p>
                <p><strong>Email:</strong> ${errorData.userEmail}</p>
                <p><strong>User ID:</strong> ${errorData.userId || 'N/A'}</p>
              </div>
              ` : ''}

              ${errorData.userMessage ? `
              <div class="error-section">
                <h3>💬 User Message</h3>
                <div class="user-message">
                  "${errorData.userMessage}"
                </div>
              </div>
              ` : ''}

              <div class="error-section">
                <h3>🐛 Error Details</h3>
                <p><strong>Message:</strong> ${errorData.message || 'No message available'}</p>
                
                ${errorData.browserInfo ? `
                <h4>🌐 Browser Information</h4>
                <p><strong>User Agent:</strong> ${errorData.browserInfo.userAgent || 'Unknown'}</p>
                <p><strong>URL:</strong> ${errorData.browserInfo.url || 'Unknown'}</p>
                <p><strong>Language:</strong> ${errorData.browserInfo.language || 'Unknown'}</p>
                ` : ''}
              </div>

              <div class="error-section">
                <h3>🔧 Quick Actions</h3>
                <p>🔗 <a href="https://ydestiny.com/admin/errors" style="color: #1890ff;">View in Admin Dashboard</a></p>
                <p>📧 Reply to this email to contact the user directly</p>
                <p>🔍 Error ID for reference: <code>${data.errorId}</code></p>
              </div>
            </div>
            <div class="footer">
              <p>Sent automatically by YDestiny Error Reporting System</p>
              <p style="font-size: 12px; color: #999;">
                This error was ${errorData.userMessage ? 'reported by user' : 'detected automatically'} at ${new Date().toLocaleString()}
              </p>
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
      to: type === 'contact' ? 'contact@ydestiny.com' : 
          type === 'error_report' ? 'dev@ydestiny.com' : // Send error reports to dev team
          to,
      subject: template.subject,
      html: template.html,
    };

    // For contact form, also send a copy to the sender
    if (type === 'contact') {
      mailOptions.replyTo = to;
    }

    // For error reports, set reply-to as user email if available
    if (type === 'error_report' && data.errorData?.userEmail) {
      mailOptions.replyTo = data.errorData.userEmail;
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