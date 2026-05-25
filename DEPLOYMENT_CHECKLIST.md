
# 🚀 Deployment Checklist

Your application is ready to deploy! Follow these steps ensuring your live site works correctly.

## 1. Deploy the Code

You have two options:

### Option A: Using Git (Recommended)
If your project is connected to GitHub/GitLab and Vercel:
1.  Push your changes:
    ```bash
    git push origin main
    ```
2.  Vercel will automatically detect the push and start building.

### Option B: Using Vercel CLI
If you prefer manual deployment or aren't using Git integration:
1.  Run the deployment script:
    ```powershell
    .\deploy.bat
    ```
    (This runs `vercel --prod`)

## 2. Configure Environment Variables on Vercel (CRITICAL)

Your local `.env.local` file is **NOT** uploaded to Vercel for security reasons. You must add these manually in the Vercel Dashboard.

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project.
3.  Go to **Settings** > **Environment Variables**.
4.  Add the following keys (copy values from your local `.env.local`):
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Update Supabase Authentication Settings

Your authentication currently redirects to `localhost:3000`. You need to add your production URL.

1.  After deployment, copy your **Vercel Production URL** (e.g., `https://your-app.vercel.app`).
2.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
3.  Go to **Authentication** > **URL Configuration**.
4.  **Site URL**: Set this to your Vercel URL (e.g., `https://your-app.vercel.app`).
5.  **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`.
6.  (If using Google Login) Go to **Google Cloud Console** > **APIs & Services** > **Credentials**.
    *   Edit your OAuth Client.
    *   Add `https://your-app.vercel.app/auth/callback` to **Authorized redirect URIs**.

## 4. Verify

1.  Visit your live Vercel URL.
2.  Try signing up/logging in.
3.  Check if the dashboard loads data correctly.
