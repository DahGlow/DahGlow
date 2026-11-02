# Dah Glow customer spaces

## Implemented

- Compact settings rows (48 px targets) and contact-preference navigation.
- Email-first login, 4-digit code verification and password setup; password sign-in remains available. Existing Google/Apple PKCE OAuth is reused. No Facebook login or fabricated offers.
- Account switch page with add/remove actions. Real Supabase sessions are encrypted with a non-extractable AES-GCM device key in IndexedDB. Passwords are never stored. Switching uses the single existing Supabase client; expired/revoked sessions require authentication. Signing out locally removes only that account's saved access.
- Identity-scoped query caches, carts and recently viewed products prevent displaying the previous account's state during switching.
- Wallet, payment information and paginated wallet history pages reuse Shopify Customer Account authentication and store-credit APIs. Balances and transactions are not cached for six hours. No fabricated balance, withdrawals, saved cards or promotional credits.
- The wallet uses `src/assets/card-logo.jpeg` and `src/assets/black-friday-wallet.jpeg` supplied in the project. Payment/card entry stays at Shopify-hosted checkout. Offers depicted inside supplied campaign art are not asserted by the app; Shopify confirms eligibility.
- Following and browsed store libraries read customer-owned cloud records. Browsing records are saved when authenticated users actually open a vendor page. Purchased stores are resolved from verified, paid/non-cancelled Shopify orders and paginated order history; actual vendor names are used. The backend additionally compares Shopify order.customer.id with the authenticated connected customer's ID.
- Vendor pages have compact Home / Items / New / Promo / Review sections, exact-vendor catalog filtering, creation-date groups, actual compare-at discounts, and a frosted-glass store information sheet.
- Followers count actual Dah Glow follows, polled every 30 seconds; product rating is a weighted average of available Shopify `reviews.rating` and `reviews.rating_count` metafields. No fake followers, written reviews or sales-surge metrics.
- Product fetching retains the requested six-hour cache. Orders, wallet, consent, follows and visits do not use it.

## Database verification performed
`dg_store_visits`, `dg_contact_preferences`, and `dg_purchased_stores` were created successfully through Cloud SQL. Catalog inspection confirms RLS enabled on all three. Read/insert/update/delete policies for visits and preferences are separately scoped to `auth.uid()`. Verified purchases have only an authenticated own-row select policy; customers cannot manufacture purchase records via inserts or updates. All new user foreign keys point to `public.user_profiles(id)`.
Existing `dg_follows` select/insert/delete ownership policies were inspected and are owner-scoped.

## Configuration and limits
- Saved sessions are local to the same browser/device/origin, not portable to another browser. Clearing browser data removes saved-account access. A shared device should use Remove an account or Sign out after use.
- Google sign-in is currently disabled in the provided backend context. Enable Google/Apple in Cloud → Users → Auth Settings and configure each provider's callback in its developer console. Preview/default publish redirect links are auto-configured, but provider credentials must be enabled. Custom published links and personal domains require an allowed redirect pattern `https://YOUR_DOMAIN/**`. Live Preview uses the existing cross-origin PKCE popup and relays only the one-time code with `postMessage(..., '*')`.
- Shopify store-credit balance and transaction reads require `customer_read_store_credit_accounts` and `customer_read_store_credit_account_transactions`, protected-customer-data approval where applicable, and store credit enabled in Shopify. The app shows an actionable API error if these are unavailable, rather than a fake zero balance.
- Shopify product-review metafields must be exposed to the Storefront API for ratings to appear. Missing ratings are explicitly unavailable, not zero.
- Shopify vendor resolution for purchased stores requires existing Admin order read access; orders older than Shopify's available scope cannot be invented. Check older orders loads another uncached page.
- Contact choices are persisted securely. This does not by itself activate an outbound marketing provider. SMS/WhatsApp controls remain disabled because no messaging services/verified channel setup were supplied. Operational/security emails are independent of marketing consent.
- No new provider credentials, card details, or service-role credentials were placed in frontend code.

## Testing status
Database DDL and RLS catalog verification: completed.
Browser network inspection: no Live Preview requests were available. Existing customer-account logs contained one earlier HTTP 499 (2026-11-02 14:39:47Z), not a validation of these changes.
There is no browser automation or build execution tool in this editing environment. Account switching with two actual accounts, OTP delivery, Google/Apple callbacks, authenticated wallet reads, paid-order vendor resolution, device IndexedDB compatibility and responsive rendering have not been executed end to end. Implementation is not a claim that those live tests passed.
