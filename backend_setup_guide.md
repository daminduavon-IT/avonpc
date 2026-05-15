# Avon PC: Email & Logistics Backend Deployment Guide

This guide will explain how to configure and run the new Express Microservice responsible for dispatching branded Avon PC HTML emails to your customers and officers.

## 1. Environment Configuration

Navigate to the `server/` directory you just created:
```bash
cd server
```

Open the `server/.env.example` file and rename it to `.env`. Fill in your actual SMTP credentials:
```env
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_company_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=officer@avonpc.com
```

> **Note for Gmail Users:** If you are using Gmail, you MUST generate an "App Password" to place in the `SMTP_PASS` field instead of your regular password. Find this under Google Account Settings -> Security -> 2-Step Verification -> App Passwords.

## 2. Starting the Server

The server requires `express`, `nodemailer`, `cors`, and `dotenv`. I have automatically initialized the `package.json` and installed the dependencies for you.

To boot the email dispatcher, ensure you are in the `server` folder and run:
```bash
node index.js
```

You should see:
`Avon PC Email Microservice listening on port 5000`

## 3. Testing the Integration

With both your React App (`npm run dev`) and the Express Mailer (`node index.js`) running simultaneously:
1. Go to your frontend storefront.
2. Add a product to your quote cart.
3. Proceed to Step 2 (Logistics).
4. Try to submit **without** a bank slip using Store Pickup or Avon Premium Delivery. You should be blocked with an error toast asking for a Bank Slip.
5. Upload a slip (or change it to Local Courier which allows COD).
6. Press Complete Checkout.

The moment the checkout saves to Firebase, you will see a request hit your Express terminal, generating and firing the beautifully branded HTML confirmation emails instantly to both you and the customer!
