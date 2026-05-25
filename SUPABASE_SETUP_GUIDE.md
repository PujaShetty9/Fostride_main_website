# Supabase Setup Guide for R3Bin Dashboard

## ✅ Current Status
Your application is already connected to Supabase! Here's what's working:

### Connected Features:
1. **Authentication** - Sign in/Sign up via `supabase.auth`
2. **Live Analytics** - Real-time waste data from `r3bin_waste_logs`
3. **Bin Registry** - Bin status from `r3bin_registry`
4. **Contact Form** - Messages stored in database
5. **Live Graphs** - Collection trends, waste composition, hourly activity

---

## 🔧 Vercel Environment Variables

Make sure these are set in your Vercel project settings:

### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://paddfikoiiozhgsczlpl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGRmaWtvaWlvemhnc2N6bHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDI4NDIsImV4cCI6MjA4MTIxODg0Mn0.mb6vPnPq5GeB__M22lq-nBqj5XZazgSTC32QDCDQsjI
GMAIL_USER=tech@fostride.com
GMAIL_PASS=mtaa nchs jani bzjl
RECIPIENT_EMAIL=tech@fostride.com
```

**How to add to Vercel:**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable above
4. Select "Production", "Preview", and "Development" scopes
5. Click "Save"
6. Redeploy your project

---

## 📊 Database Tables

Your Supabase database should have these tables:

### Core Tables (Already in use):
1. **r3bin_waste_logs** - Stores all waste collection events
2. **r3bin_registry** - Stores bin information and status
3. **contact_messages** - Stores contact form submissions

### Legacy Tables (From schema file):
- `waste_collections`
- `waste_composition`
- `hourly_activity`
- `bins`
- `alerts`

**Note:** Your dashboard is using `r3bin_waste_logs` and `r3bin_registry` instead of the legacy tables.

---

## 🔐 Row Level Security (RLS)

Make sure RLS is properly configured:

### For `contact_messages`:
```sql
-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts via the function
CREATE POLICY "Allow public inserts via function"
ON contact_messages FOR INSERT
TO public
WITH CHECK (true);
```

### For `r3bin_waste_logs`:
```sql
-- Enable RLS
ALTER TABLE r3bin_waste_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read"
ON r3bin_waste_logs FOR SELECT
TO authenticated
USING (true);
```

### For `r3bin_registry`:
```sql
-- Enable RLS
ALTER TABLE r3bin_registry ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read"
ON r3bin_registry FOR SELECT
TO authenticated
USING (true);
```

---

## 🚀 Testing the Connection

### 1. Test Authentication:
- Go to `/login` on your site
- Try signing up with a new account
- Check Supabase → Authentication → Users

### 2. Test Dashboard Data:
- Go to `/dashboard` (must be logged in)
- Check if graphs are loading
- Verify bin status cards appear

### 3. Test Contact Form:
- Go to home page
- Fill out the contact form
- Check Supabase → Table Editor → `contact_messages`

---

## 📝 Database Functions

Your app uses this PostgreSQL function for secure form submissions:

```sql
CREATE OR REPLACE FUNCTION insert_contact_message(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_message TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO contact_messages (name, email, phone, message)
  VALUES (p_name, p_email, p_phone, p_message);
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

---

## 🔍 Troubleshooting

### If dashboard shows no data:
1. Check if you're logged in (authentication required)
2. Verify `r3bin_waste_logs` table has data
3. Check browser console for errors
4. Verify RLS policies allow reading

### If authentication doesn't work:
1. Check Supabase → Authentication → Settings
2. Ensure Email provider is enabled
3. Verify redirect URLs include your Vercel domain

### If contact form fails:
1. Check `insert_contact_message` function exists
2. Verify `contact_messages` table exists
3. Check email environment variables in Vercel

---

## ✨ Everything is Connected!

Your app is fully integrated with Supabase for:
- ✅ User authentication (sign in/sign up)
- ✅ Live waste analytics
- ✅ Real-time graphs and charts
- ✅ Bin status monitoring
- ✅ Contact form submissions
- ✅ Email notifications

Just make sure the environment variables are set in Vercel and you're good to go! 🚀
