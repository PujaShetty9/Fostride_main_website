
# Supabase Auth & RLS Setup Instructions

To complete the "Sign In / Sign Up" and "User-Specific Analytics" features, you need to apply the database changes.

## 1. Run the SQL Migration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Open the **SQL Editor**.
3.  Copy the contents of `setup_user_bins.sql` (located in the project root).
4.  Paste it into the editor and click **Run**.

This will:
-   Create the `user_bins` table to link Users to Bins.
-   Enable RLS (Row Level Security) on the `user_bins` table.

## 2. Verify Auth Settings

1.  In Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2.  Ensure your **Site URL** is set to `http://localhost:3000` (for local dev) or your production URL.
3.  Add `http://localhost:3000/auth/callback` to **Redirect URLs**.

## 3. Testing the Flow

1.  Start the app: `npm run dev`.
2.  Go to `/signup` and create an account.
3.  Check your email for the confirmation link (or confirm manually in Supabase Dashboard > Authentication > Users if testing locally with fake emails).
4.  After signing in, you will be redirected to the Dashboard.
5.  If you haven't linked a bin yet, you will see a "Connect Your Bin" dialog.
6.  Enter a valid Bin ID (e.g., `Bin_001` or any `bin_id` that exists in your `r3bin_registry` or `r3bin_waste_logs`).
7.  Once connected, the dashboard will load data specific to that bin!

## Troubleshooting

-   **"Bin ID not found"**: Ensure the Bin ID you enter exists in the `r3bin_registry` table.
-   **No Data Showing**: Ensure `r3bin_waste_logs` has entries with the matching `bin_id`.
