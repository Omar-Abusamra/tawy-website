# Resend Customer Confirmation Setup

The React app calls a Supabase Edge Function named `send-order-confirmation` after a cash on delivery order is saved.

## 1. Create a Resend API Key

1. Go to Resend.
2. Create an API key.
3. Keep it private. Do not put it in `.env`.

## 2. Add Supabase Function Secrets

In Supabase Dashboard:

1. Open your project.
2. Go to Edge Functions.
3. Open Secrets.
4. Add:

```text
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=TAWY <onboarding@resend.dev>
```

For production, verify your domain in Resend and change `RESEND_FROM_EMAIL` to something like:

```text
RESEND_FROM_EMAIL=TAWY <orders@yourdomain.com>
```

## 3. Deploy The Function

Install and login to the Supabase CLI, then run:

```bash
supabase functions deploy send-order-confirmation --project-ref lsadrxsizmajuvklwzrn
```

## 4. Test

1. Restart the React dev server.
2. Place a COD order using a real email address.
3. Check:
   - Supabase `orders`
   - Supabase `order_items`
   - Customer inbox
   - Supabase Edge Function logs if the email does not arrive

If the order saves but no email arrives, the storefront will still succeed and log the confirmation email failure in the browser console.
