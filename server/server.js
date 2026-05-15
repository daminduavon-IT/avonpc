const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true', // Matches SMTP_SECURE=true in .env
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/send-quote-emails', async (req, res) => {
  try {
    const { name, company, email, phone, products, logisticsTier, paymentMethod, paymentSlipUrl } = req.body;

    // 1. Fetch Dynamic Admin Email from Supabase settings
    let adminRecipient = process.env.ADMIN_EMAIL || 'avonpcit@gmail.com';
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'communications')
        .single();
      if (data?.value?.notificationEmail) {
        adminRecipient = data.value.notificationEmail;
      }
    } catch (sErr) {
      console.warn('Supabase settings fetch failed, using fallback:', sErr.message);
    }

    const timestamp = new Date().toLocaleString();
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const isFlashSale = products.some(p => p.isFlashSale);
    const logoUrl = "https://res.cloudinary.com/dg6sdm7f8/image/upload/v1773571642/wbyymaskq4dd3iuzzrsi.png";

    // 2. DESIGN: CUSTOMER PREMIUM EMAIL (User's Style)
    const customerHtml = `
      <div style="background-color: #f4f7f6; padding: 40px 20px; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #003d19; padding: 40px 20px; text-align: center;">
            <img src="cid:avon-logo" alt="Avon Pharmo Chem" style="width: 220px; margin-bottom: 10px;">
            <h1 style="color: #ffffff; font-size: 22px; margin: 0; letter-spacing: 2px; font-weight: 300;">ORDER ACKNOWLEDGEMENT</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #2d3748; margin-top: 0;">Dear <strong>${name}</strong>,</p>
            <p style="line-height: 1.8; color: #4a5568;">Your request has been successfully logged into our system. At <strong>Avon Pharmo Chem</strong>, we prioritize precision and quality. Our team is currently reviewing your requirements.</p>

            <!-- Dual-Column Summary Box -->
            <div style="background-color: #f9fbfb; border-radius: 8px; padding: 25px; margin: 30px 0; border: 1px solid #edf2f7;">
              <table width="100%" style="border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; vertical-align: top; border-right: 1px solid #edf2f7; padding-right: 15px;">
                    <strong style="display: block; color: #2d3748; margin-bottom: 5px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Delivery Method</strong>
                    <span style="color: #003d19; font-weight: bold; font-size: 16px;">${logisticsTier.toUpperCase().replace(/-/g, ' ')}</span>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 15px; text-align: right;">
                    <strong style="display: block; color: #2d3748; margin-bottom: 5px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Payment Method</strong>
                    <span style="color: #4a5568; font-size: 16px;">${paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Flash Sale Alert -->
            ${isFlashSale ? `
              <div style="background: linear-gradient(135deg, #003d19 0%, #005a26 100%); border-radius: 10px; padding: 20px; margin-bottom: 30px; text-align: center; color: #ffffff; box-shadow: 0 4px 6px rgba(0, 61, 25, 0.2);">
                <span style="font-size: 24px; opacity: 0.9;">⚡</span>
                <h3 style="margin: 10px 0; color: #ffffff; font-weight: 600;">Exclusive Pricing Locked</h3>
                <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.6;">Your Flash Sale items have been safely reserved. Our finance team will verify your final invoice shortly.</p>
              </div>
            ` : ''}

            <!-- Itemized Summary -->
            <h3 style="font-size: 14px; text-transform: uppercase; color: #718096; letter-spacing: 1px; margin-bottom: 15px; border-bottom: 2px solid #edf2f7; padding-bottom: 10px;">Itemized Summary</h3>
            <table width="100%" style="border-collapse: collapse; margin-bottom: 30px;">
              <tbody>
                ${products.map(p => `
                  <tr style="border-bottom: 1px solid #edf2f7;">
                    <td style="padding: 15px 0;">
                      <span style="font-weight: 600; color: #2d3748; display: block; font-size: 15px;">${p.name}</span>
                      <small style="color: #a0aec0; font-size: 13px;">${p.brand} | ${p.model || 'Standard Grade'}</small>
                    </td>
                    <td style="padding: 15px 0; text-align: right; font-weight: bold; color: #2d3748; font-size: 15px;">x${p.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Footer Support Banner -->
            <div style="text-align: center; padding: 30px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
              <p style="margin: 0 0 5px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Direct Assistance</p>
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1e293b;">Speak with a Technical Specialist</p>
              <a href="tel:+94112345678" style="color: #003d19; text-decoration: none; font-size: 18px; font-weight: bold;">+94 112 345 678</a>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8;">
            Avon Pharmo Chem (Pvt) Ltd. | Nugegoda, Sri Lanka<br/>
            <strong style="color: #64748b;">Precision. Quality. Integrity.</strong>
          </div>
        </div>
      </div>
    `;

    // 3. DESIGN: ADMIN ALERT EMAIL (+ Metadata Sidebar)
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🚨 NEW ORDER ALERT</h2>
        </div>
        <div style="padding: 20px;">
          <p><strong>Customer:</strong> ${name} (${company})</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Delivery:</strong> <span style="text-transform: uppercase; font-weight: bold;">${logisticsTier}</span></p>
          
          <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;">Products Requested</h3>
          <ul style="list-style: none; padding: 0;">
            ${products.map(p => `
              <li style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <strong style="color: #ef4444;">${p.quantity}x</strong> ${p.name} <br/>
                <span style="font-size: 12px; color: #64748b;">${p.brand} | Model: ${p.model}</span>
              </li>
            `).join('')}
          </ul>
          
          ${paymentSlipUrl ? `
            <div style="margin-top: 20px; background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6;">
              <p style="margin:0 0 10px 0;"><strong>Payment Slip Uploaded</strong></p>
              <a href="${paymentSlipUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View Payment Slip</a>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.APP_URL || 'http://localhost:8080'}/admin/quotes" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
          </div>

          <!-- Metadata Sidebar -->
          <div style="margin-top: 40px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
             <h4 style="margin: 0 0 10px 0; color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Request Metadata</h4>
             <table width="100%" style="font-size: 13px; color: #475569;">
               <tr>
                 <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>Timestamp:</strong></td>
                 <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${timestamp}</td>
               </tr>
               <tr>
                 <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;"><strong>IP Address:</strong></td>
                 <td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${userIP}</td>
               </tr>
               <tr>
                 <td style="padding: 6px 0;"><strong>System ID:</strong></td>
                 <td style="padding: 6px 0; text-align: right; font-family: monospace;">AVON-${Math.random().toString(36).substr(2, 6).toUpperCase()}</td>
               </tr>
             </table>
          </div>
        </div>
      </div>
    `;

    // 4. DISPATCH EMAILS
    const emailAttachments = [
      {
        filename: 'avon-logo.png',
        path: logoUrl, // CID attachment references this remote URL directly
        cid: 'avon-logo'
      }
    ];

    await Promise.all([
      // Primary Technical Alert to Admin
      transporter.sendMail({
        from: '"Avon Sales Automation" <system@avonpc.com>',
        to: adminRecipient,
        subject: `🚨 NEW ORDER: ${name} - ${logisticsTier.toUpperCase()}`,
        html: adminHtml,
        attachments: emailAttachments
      }),
      // Branded Confirmation to Customer
      transporter.sendMail({
        from: '"Avon Pharmo Chem" <sales@avonpc.com>',
        to: email,
        subject: 'Order Confirmation - Avon Pharmo Chem (Pvt) Ltd',
        html: customerHtml,
        attachments: emailAttachments
      }),
      // Archive copy (Customer layout) to Admin
      transporter.sendMail({
        from: '"Order Archive" <archive@avonpc.com>',
        to: adminRecipient,
        subject: `[CUSTOMER COPY] Order for ${name} (${company})`,
        html: customerHtml,
        attachments: emailAttachments
      })
    ]);

    res.status(200).json({ success: true, message: 'Communications dispatched successfully.' });
  } catch (error) {
    console.error('SMTP Dispatch Error:', error);
    res.status(500).json({ success: false, error: 'Internal SMTP failure.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node SMTP Microservice activated on port ${PORT}`);
});