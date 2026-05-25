
# 🔐 Auth & Bin Linking Setup

Follow these steps to finalize the new Authentication and Bin Linking features.

## 1. SQL Updates (Required)

You need to add the database triggers that handle auto-linking bins when a user signs up.

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy the code from `setup_auth_triggers.sql`.
4.  Paste it into the editor and click **Run**.

This script:
-   Creates a trigger to automatically insert a record into `user_bins` when a new user signs up with a `bin_id`.
-   Adds a utility function `check_bin_exists` to validate Bin IDs during sign-up.

## 2. Google Login Configuration

To enable "Login with Google":

1.  Go to **Authentication** > **Providers** in Supabase.
2.  Enable **Google**.
3.  You will need to set up a Google Cloud Project to get the **Client ID** and **Client Secret**.
    *   [Supabase Docs: Google Login Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
4.  Add the Client ID/Secret to the Supabase provider settings.
5.  **Important**: Ensure `http://localhost:3000/auth/callback` is listed in your **Authorized Redirect URIs** in the Google Cloud Console.
6.  Also add it to Supabase **Authentication** > **URL Configuration** > **Redirect URLs**.

## 3. Testing

1.  **Sign Up**: Try creating a new account. You MUST enter a valid `bin_id` (e.g., `Bin_001`).
2.  **Login**: Try logging in with the email/password or Google.
3.  **Navbar**: Verify the navbar shows "Sign In" when logged out, and "Log Out" when logged in.
4.  **Dashboard**: After login, you should see data relevant to your bin.
