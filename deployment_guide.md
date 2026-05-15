# Deployment Guide: React Frontend & Express Backend

Yes! You absolutely can host this on cPanel. Since your project has two parts (the React Storefront and the Node.js Express Mailer), you have a few options depending on what your specific cPanel hosting plan supports.

> **Crucial First Step:** Before deploying, we updated your code to look for a production URL. You must add `VITE_API_URL=https://your-backend-domain.com` to a `.env` file in the root of your `avonpc` folder before building, or it will default to `localhost:5000`.

---

## Method 1: Host Everything on cPanel (Recommended if supported)
*Note: This requires your cPanel provider to have the **Setup Node.js App** feature enabled (often included with CloudLinux).*

### Part A: Deploying the Frontend (React/Vite)
1. In your local terminal (inside `avonpc`), run: `npm run build`
2. This creates a `dist` folder. Zip the contents of the `dist` folder.
3. Open your cPanel **File Manager** and navigate to `public_html` (or your add-on domain folder).
4. Upload your ZIP file and extract it. 
5. **Important:** Because React uses client-side routing, you must create a file named `.htaccess` in your `public_html` and add this code so users don't get 404 errors when refreshing:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Part B: Deploying the Backend (Express Mailer)
1. Zip the contents of your `server/` folder (DO NOT include the `node_modules` folder).
2. Look for the **Setup Node.js App** icon in cPanel under the Software section. Click "Create Application".
3. Set Node.js version to 18 or 20.
4. Set **Application mode** to `Production`.
5. Set **Application root** to a new folder outside of `public_html` (e.g., `email-backend`).
6. Set **Application URL** to an endpoint like `api.yourdomain.com` or `yourdomain.com/api`.
7. Set **Application startup file** to `index.js`.
8. Click **Create**.
9. Go to cPanel File Manager, find your new `email-backend` folder, and upload/extract your zipped `server/` files there.
10. Go back to Setup Node.js App, scroll down to **Environment Variables**, and add your SMTP credentials (PORT=5000, SMTP_HOST, SMTP_USER, etc.).
11. Click **Run NPM Install**, then click **Start App**. 
12. *Don't forget to rebuild your frontend (Part A) with `VITE_API_URL=https://[YOUR_APP_URL]/api/quote` so the storefront knows where to talk!*

---

## Method 2: Split Hosting (Best for Basic/Cheap cPanel Plans)
If your cPanel *does not* have the "Setup Node.js App" icon, it means it only supports PHP (like WordPress) and cannot run Node.js backend servers natively. 

In this case:
1. **Frontend:** Host the React Frontend on your cPanel `public_html` following **Part A** above. It will work perfectly as a static site.
2. **Backend:** Host the Express Mailer for FREE on a specialized Node backend provider like **Render.com**.

### How to Host Backend on Render:
1. Upload your `server` code to a GitHub repository.
2. Go to [Render.com](https://render.com) and sign up.
3. Click **New +** -> **Web Service** -> Connect your GitHub repo.
4. Set the Start Command to `node index.js`.
5. Under Environment, add all your SMTP environment variables.
6. Render will generate a live URL for you (e.g., `https://avon-mailer.onrender.com`).
7. Update your local React app's `.env` to have `VITE_API_URL=https://avon-mailer.onrender.com/api/quote`.
8. Run `npm run build` and upload the new `dist` folder to your cPanel `public_html`.
