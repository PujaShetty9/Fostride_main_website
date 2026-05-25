# Fixing Supabase Redirect Issue

## Problem
When signing in with Google OAuth, users are being redirected to `www.r3bin.fostride.com` instead of staying on the current domain.

## Solution

### 1. Code Changes (Already Applied)
✅ Created `/app/auth/callback/page.tsx` to handle OAuth callbacks
✅ Updated `/app/login/page.tsx` to use the callback route
✅ Updated middleware to allow the callback route

### 2. Supabase Dashboard Configuration (YOU NEED TO DO THIS)

You **MUST** update your Supabase project settings to allow the correct redirect URLs:

#### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `paddfikoiiozhgsczlpl`
3. Go to **Authentication** → **URL Configuration**
4. Update the following settings:

**Site URL:**
- For Development: `http://localhost:3000`
- For Production: `https://www.fostride.com` (or your actual domain)

**Redirect URLs (Add these to the allowed list):**
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
https://www.fostride.com/auth/callback
https://www.fostride.com/dashboard
```

**REMOVE this URL if it exists:**
```
https://www.r3bin.fostride.com/**
```

5. Click **Save**

### 3. How It Works Now

1. User clicks "Sign in with Google"
2. Google authenticates the user
3. Supabase redirects to: `{your-domain}/auth/callback`
4. The callback page processes the authentication
5. User is redirected to `/dashboard` on the **same domain**

### 4. Testing

After updating the Supabase settings:

1. **Development:**
   - Go to `http://localhost:3000/login`
   - Click "Sign in with Google"
   - You should stay on `localhost:3000` and be redirected to `/dashboard`

2. **Production:**
   - Go to your production URL
   - Click "Sign in with Google"
   - You should stay on the same domain and be redirected to `/dashboard`

### 5. Important Notes

- The redirect URL **MUST** match exactly what's configured in Supabase
- If you're still being redirected to `www.r3bin.fostride.com`, it means the Supabase dashboard settings haven't been updated yet
- You may need to wait a few minutes after updating Supabase settings for changes to take effect
- Clear your browser cache/cookies if you're still experiencing issues

## Email/Password Sign In

Email/password sign-in is not affected by this issue and will work correctly without any Supabase dashboard changes.
