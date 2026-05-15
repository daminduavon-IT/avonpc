const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

window_theme = {
   navy: '#0C4C04',
   green: '#00D289',
   orange: '#ea7000',
   light: '#F8FAFC'
}

const generateBrandedEmail = (title, preheader, bodyContent, customer, products, total) => {
  let productsHtml = products.map(p => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: ${window_theme.navy};">
        <strong>${p.name}</strong><br/>
        <span style="font-size: 12px; color: #64748b;">${p.model || 'N/A'} ${p.variantLabel ? `| ${p.variantLabel}` : ''}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${p.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">Rs. ${(p.price || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
  </head>
  <body style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: ${window_theme.light}; margin: 0; padding: 40px 20px;">
    <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(10, 37, 64, 0.05);">
      
      <!-- Header -->
      <div style="background-color: ${window_theme.navy}; padding: 30px; text-align: center; border-bottom: 4px solid ${window_theme.green};">
         <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">AVON PHARMO CHEM</h1>
         <p style="color: ${window_theme.green}; margin: 5px 0 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Scientific Equipment Supply</p>
      </div>

      <!-- Body -->
      <div style="padding: 40px 30px;">
         <h2 style="color: ${window_theme.navy}; margin-top: 0; font-size: 20px;">${title}</h2>
         <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">${preheader}</p>
         
         ${bodyContent}

         <h3 style="color: ${window_theme.navy}; font-size: 16px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid ${window_theme.light};">Requested Items</h3>
         <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
           <thead>
             <tr style="background-color: ${window_theme.light};">
               <th style="padding: 12px; text-align: left; color: #64748b; font-weight: bold;">Product</th>
               <th style="padding: 12px; text-align: center; color: #64748b; font-weight: bold;">Qty</th>
               <th style="padding: 12px; text-align: right; color: #64748b; font-weight: bold;">Unit Price</th>
             </tr>
           </thead>
           <tbody>
             ${productsHtml}
           </tbody>
           <tfoot>
             <tr>
               <td colspan="2" style="padding: 15px 12px; text-align: right; font-weight: bold; color: #64748b;">Estimated Total:</td>
               <td style="padding: 15px 12px; text-align: right; font-weight: 900; font-size: 18px; color: ${window_theme.navy};">Rs. ${total.toFixed(2)}</td>
             </tr>
           </tfoot>
         </table>

         <div style="background-color: ${window_theme.light}; border-radius: 8px; padding: 20px;">
            <h4 style="margin: 0 0 10px 0; color: ${window_theme.navy}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Customer Reference</h4>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">
              <strong>Name:</strong> ${customer.name}<br/>
              <strong>Email:</strong> ${customer.email}<br/>
              <strong>Company:</strong> ${customer.company || 'N/A'}<br/>
              <strong>Phone:</strong> ${customer.phone}<br/>
              <strong>Location:</strong> ${[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}<br/>
              <strong>Logistics Option:</strong> ${customer.logisticsType === 'Courier' ? 'Local Courier (COD Applicable)' : customer.logisticsType === 'Avon Delivery' ? 'Avon Premium Delivery' : 'Store Pickup'}<br/>
            </p>
         </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #0f172a; padding: 30px; text-align: center;">
         <p style="color: #94a3b8; margin: 0; font-size: 12px;">This is an automated request acknowledgement, not an official tax invoice.</p>
         <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">&copy; ${new Date().getFullYear()} Avon Pharmo Chem. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// API Route for order handling
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, company, city, state, country, message, logisticsType, bankSlipUrl, products } = req.body;

  try {
    const total = products.reduce((acc, p) => acc + (p.price || 0) * p.quantity, 0);
    const customer = { name, email, company, phone, city, state, country, logisticsType };

    // 1. Send Email to Customer
    if (email) {
      const customerBody = `
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Dear ${name},<br/><br/>
          We have received your order request. A dedicated scientific equipment officer will review your requested items, verify your selected logistics method, and dispatch your order. 
        </p>
        ${bankSlipUrl ? `<p style="margin-top: 15px;"><a href="${bankSlipUrl}" style="background: ${window_theme.orange}; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">View Your Uploaded Slip</a></p>` : ''}
      `;
      const customerHtml = generateBrandedEmail('Order Request Received', 'Thank you for choosing Avon Pharmo Chem.', customerBody, customer, products, total);

      await transporter.sendMail({
        from: `"Avon Pharmo Chem" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Order Request Acknowledgment - Avon PC',
        html: customerHtml,
        attachments: bankSlipUrl ? [{ filename: 'Payment_Slip', path: bankSlipUrl }] : []
      });
    }

    // 2. Send Copy to Admin/Officer
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      const adminBody = `
        <div style="border-left: 4px solid ${window_theme.orange}; padding-left: 15px; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Action Required:</strong> A new order request has been submitted by the portal.</p>
          ${bankSlipUrl ? `<p style="margin-top: 10px;"><a href="${bankSlipUrl}" style="background: ${window_theme.orange}; color: white; padding: 8px 15px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 12px; display: inline-block;">View Payment/Bank Slip</a></p>` : ''}
          ${message ? `<p style="margin-top: 10px; font-style: italic; background: ${window_theme.light}; padding: 10px; border-radius: 5px;">"${message}"</p>` : ''}
        </div>
      `;
      const adminHtml = generateBrandedEmail(`New Order: ${name} (${company || 'Individual'})`, 'An order requires officer verification.', adminBody, customer, products, total);

      await transporter.sendMail({
        from: `"Avon Ordering System" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `Action Required: New Order from ${name}`,
        html: adminHtml,
        attachments: bankSlipUrl ? [{ filename: 'Payment_Slip', path: bankSlipUrl }] : []
      });
    }

    res.status(200).json({ success: true, message: 'Emails dispatched successfully' });
  } catch (error) {
    console.error('Error dispatching emails:', error);
    res.status(500).json({ success: false, error: 'Failed to send communication emails' });
  }
});

app.listen(port, () => {
  console.log(`Avon PC Email Microservice listening on port ${port}`);
});
