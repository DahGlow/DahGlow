# Dah Glow private administration and customer workflows
Date: 2026-11-02. This report distinguishes implemented source, applied database changes, and actually observed live results. It does not certify an untested production deployment.

## Private entry URL

`/private-control/e0a9a9e53ca6451c8ab02bc744de6ddfc2b147e9f18042fe8530371fc4f07d07`

Sign in through the normal Dah Glow login page first, then open this path on your site's domain. Guests and unauthorized accounts see the existing Not Found page, not a revealing admin login screen. No private entry link was added to customer navigation. The random segment is stored in the protected `dg_admin_config` table, not embedded in the frontend route definition. The frontend uses generic parameterized routes.

Initial authorized Super Admin emails:
- berryxoe@gmail.com
- dawiniefleury07@gmail.com

SQL inspection found an existing verified Auth account for berryxoe@gmail.com. No existing Auth account was found for dawiniefleury07@gmail.com; that user must complete normal email verification first. No account, password, OTP, or session was fabricated for either email.

## Verified in this session

1. OnSpace Cloud is ready.
2. The live GET `shopify-storefront` health endpoint returned `storefront: connected`, Shopify shop name `D'ah Glow`, actual product handles and real available Shopify variant IDs. Its product pageInfo reported hasNextPage=true. This verifies connectivity and a small product response, not the entire catalog pagination matrix.
3. All new private and supporting tables were created successfully with RLS enabled.
4. Anonymous and authenticated browser roles have no SELECT privilege on `dg_admin_allowlist` or `dg_admin_config`. Authenticated browsers cannot execute the service-only rate-limit write function.
5. SQL assertions passed for the actual verified founding account's products permission and denial when the test JWT email was changed to an unauthorized address. These are database permission tests, not browser-login or authenticated Edge Function end-to-end tests.
6. Only the requested two emails were seeded as initial Super Admins. Other role definitions have limited permissions; custom roles start empty.
7. Existing token metadata shows a stored encrypted token, status=healthy, last_refresh=2026-11-02 08:05:38.692 -05:00 and expires_at=2026-11-03 08:05:36.692 -05:00. This is a metadata observation, not a refresh-after-expiration test.
8. Existing integration-status cache separately reports an earlier non-JSON Admin setup failure. These observations conflict in time; do not treat the cached setup status as a fresh complete Admin test.
9. Database counts at inspection: zero webhook events, zero synchronized orders. No fake orders, customers, purchases, receipts, analytics, coupons, or payments were seeded.
10. Source pattern checks found no Shopify Client Secret references in frontend code and no OpenRouter requests in frontend code. A service-role variable-name mention exists in the older explanatory integration report component, not a credential value or client configuration.

## Deployment and live test limits

New source functions prepared:
- `dah-glow-admin`: per-request verified JWT/email allowlist, roles, private-entry validation, read/write operation allowlist, Shopify product management, publication, staged media, real order/customer reads, tracking updates, vendors, store settings, invitations, audit logging and settings.
- `dah-glow-support`: existing OPENROUTER_API_KEY, google/gemini-2.5-flash-lite with low reasoning effort, public product/store context and only the authenticated Shopify customer's own orders.
- `dah-glow-recovery`: rate-limited matching email + already-associated order/tracking number, generic response, email OTP sent only for matching records; no email disclosure and no tracking-number-only authentication.

Existing function source updated:
- shopify-storefront
- shopify-customer-account
- shopify-webhook
- shared Admin token authentication and CORS helpers

`supabase/config.toml` includes the new functions. Gateway verify_jwt=false is intentional for compatibility: each private endpoint itself verifies the bearer token with Supabase auth.getUser before authorizing operations. Public support accepts the existing anonymous key only for public context; user-provided invalid JWTs do not gain customer context.

Deployment of these NEW functions could not be verified: the logs tool could not find dah-glow-admin during editing, and there is no dedicated deploy or shell/build execution tool. Publishing through the OnSpace pipeline and checking Cloud → Edge Functions is still required. Existing Storefront function reachability was verified; do not infer that it is already serving all source changes from this session.

## Applied database schema

Saved migration: `supabase/migrations/202611020002_private_control.sql`.

Tables:
- dg_admin_roles
- dg_admin_allowlist
- dg_admin_profiles
- dg_admin_invitations
- dg_admin_config
- dg_store_settings
- dg_vendor_settings
- dg_product_visibility
- dg_admin_activity
- dg_admin_analytics_cache (reserved, not used to cache orders)
- dg_rate_limits
- dg_order_receipts
- dg_order_activity

Functions: dg_has_permission, dg_rate_check.
Storage bucket: dg-branding, public images only, JPEG/PNG/WebP up to 5 MB. Uploads require store, vendor or settings permissions. Browser writes to sensitive management tables are revoked; they occur only through authorized Edge Functions. Existing user tables and relationships were reused, not replaced. No user records were deleted or updated by the SQL migration tool.

## Administrative interface

New private page entry: `src/pages/PrivateControl.tsx`.
New page files under `src/pages/admin/`:
- AdminOverview.tsx
- AdminAnalytics.tsx
- AdminAddProduct.tsx
- AdminProducts.tsx
- AdminStore.tsx
- AdminVendors.tsx
- AdminOrders.tsx
- AdminCustomers.tsx
- AdminManagement.tsx
- AdminSettings.tsx

Supporting layout/features/forms:
- AdminLayout, AdminSidebar, AdminDataState, AdminDateFilter, AdminMetrics, AdminChart, AdminTopCustomers, AdminActivity, AdminConfirm, AdminOrderDetails, AdminCustomerDetails, AdminPublicationControls, AdminProductMedia
- AdminProductForm, AdminProductOptions, AdminProductVariants, AdminMediaUpload, AdminBrandUpload, AdminStoreForm, AdminVendorForm, AdminTrackingForm, AdminInvitationForm, AdminMemberForm, AdminSettingsForm

Other new admin files:
- src/admin.css
- src/types/admin.ts
- src/hooks/useAdmin.tsx
- src/hooks/usePrivateMeta.ts
- src/constants/adminNavigation.ts
- src/lib/adminProductForm.ts
- src/lib/adminUploads.ts
- supabase/functions/_shared/adminAccess.ts
- supabase/functions/_shared/adminQueries.ts
- supabase/functions/_shared/adminAnalytics.ts
- supabase/functions/_shared/adminDateRange.ts
- supabase/functions/_shared/adminProducts.ts
- supabase/functions/_shared/adminManagement.ts
- supabase/functions/_shared/publicStore.ts

Dark matte surfaces, gold-accented featured net-payment panel, outline icons, responsive sidebar, real-data loading/error/empty states and confirmation dialogs were added. Unauthorized sections are backend-denied; Settings has a locked screen when permission is absent.

### Analytics definitions

No order data is cached for six hours. The dashboard queries actual Shopify orders/customers/products; live panels use 30-second polling rather than unsupported Realtime. Date ranges are limited to one year per interactive request.

- Payments received: totalReceivedSet in Shopify shop currency.
- Refunds: totalRefundedSet.
- Net order payments: payments received minus refunds for orders created in the selected date range.
- Gross line sales/category/vendor/product charts: original unit prices × quantities on non-cancelled orders with received payment; before line discounts, refunds, shipping and tax.
- Top three customers: non-cancelled orders with received payments, ranked by retained paid amount after refunds.
- Orders are not abandoned checkout records. Cancelled, pending, paid and fulfilled counts use real Shopify statuses.

Calendar date boundaries are translated into the Shopify shop timezone, including DST, with an exclusive next-day upper bound. Today’s order/payment cards use an independent today query when today falls outside the chosen date range. This is order-cohort reporting, not settlement-date cash flow or a fabricated all-time revenue total. Customers and product counts are catalog-wide; order metrics are range-filtered. The UI explains these boundaries.

### Product management boundaries

Supported source workflows: draft/active/archive, title/description/vendor/type/handle/SEO/tags/metafields, dynamic option grid, variant price/compare-at/SKU/barcode/inventory policy, actual inventory location, variant image association, Shopify staged image/video uploads, save verification and separate channel publication/unpublication APIs.

The editor intentionally supports up to 100 variants. Products with more than 100 variants are blocked from destructive partial editing and must currently be edited in Shopify. Existing option structures are preserved while editing; full option-schema restructuring is a follow-up. Media processing and final video display require Shopify verification. Inventory quantities remain unchanged unless a location and quantity are supplied. ACTIVE product status is not equated with publication: choose an actual Shopify publication channel. Live writes were not executed in this editing session.

## Customer-facing workflows

New pages:
- LoginCode.tsx — /login/code
- ResetPassword.tsx — /account/reset-password
- AccountRecovery.tsx — /account/recovery
- EditProfile.tsx — /account/profile
- EditUsername.tsx — /account/profile/username
- ProfileQr.tsx — /account/profile/qr
- OrderTrack.tsx — /us/user/orders/track/:id
- ReceiveSuccess.tsx — /us/user/orders/receive-success/:id
- Support.tsx — /support

Updated existing pages/components:
- Login, OrderDetail, Cart, Me, Settings, Orders, Shop, VendorStore
- Header, BottomTabs, SideMenu, ProductHeader, StoreCard, OrderMoreMenu
- App, main, useAuth, auth user mapping, useCatalog, useCustomerAccount, shopify API wrapper, types/shop, Vite config and index.html

New supporting files:
- customer-updates.css
- useOrder, useSupport, useStoreSettings, productCache
- AccountAccessSheet, OrderProgress, CarrierBadge, TrackingTimeline, ReceiveOrderSheet, OrderInformation, StoreIdentity
- PasswordSetupForm, AccountRecoveryForm, SupportMessageForm
- orderTrace, storefrontProduct, storefrontCart backend helpers

### Product caching

Only public product/catalog/vendor/recommendation/suggestion requests gain the new six-hour TTL, in backend cache, React Query and optional browser persistence. Orders and carts are excluded from the browser product-cache wrapper. Customer order queries use staleTime=0, gcTime=0 and 30-second polling. Checkout and cart operations always retrieve current Shopify values. Webhooks and admin edits invalidate backend catalog cache; same-browser admin edits clear product persistence. Other already-open customer browsers can retain public product data until the six-hour TTL expires. Do not advertise cached prices/inventory as instantly fresh; Shopify cart/checkout is authoritative. Product responses too large for safe database caching are not stored as large database text.

Visibility is checked on Storefront catalog/detail/recommendation/suggestion responses and before new cart-line additions. Cached public UI entries can remain visible until expiry, but hidden products cannot be newly added through the backend.

### Orders and tracking

Order details use a fresh verified Shopify Customer Account query; there is no six-hour order cache or old snapshot fallback. Real Admin fulfillment events enrich own-order data when available. Missing tracking scans, delivery estimates and seller addresses are not invented. GOFO/USPS/UPS logos are selected only from Shopify's reported carrier; unknown carriers remain plainly labeled. Carrier tracking opens Shopify's actual tracking URL. More Logistics Details opens a bottom sheet of actual supplied events. Detailed events may require Admin permission and can be unavailable even when a carrier tracking URL exists. Interactive own-order enrichment requests up to five fulfillments and 100 events per fulfillment; the Admin detail view requests up to ten fulfillments and 50 events each to keep Shopify query cost bounded. The carrier's actual tracking link remains available for additional scans.

Receipt confirmation is ownership-checked, saved only after a real fulfilled/partially-fulfilled order is verified, and displayed on the success page only when a persisted own-user receipt exists. It is a customer acknowledgement in Dah Glow, NOT a fake Shopify delivery event or carrier proof of delivery. 'Not yet' closes the sheet. No review rewards or return deadlines are invented.

### Authentication, recovery, profile and support

- Email-first login sends an actual four-digit code, verifies it, and offers password setup; password sign-in is retained.
- Password reset uses a verified existing-account email OTP before saving the new password via Supabase Auth.
- Google and Apple reuse the existing PKCE client, cross-origin Preview popup code relay and auth callback. Provider credentials are still configuration-dependent.
- Facebook was not added: this backend supports email, Google and Apple only.
- Standalone Shop-as-Supabase-login was not invented. Existing verified Shopify Customer Account connection is available after Dah Glow sign-in, including from Cart.
- Order-assisted recovery requires the entered account email, a previously synchronized associated order/tracking number, and an emailed code. It never reveals the owning email. With zero synchronized orders currently present, that route cannot yet match records. Phone/payment recovery intentionally remains unavailable/coming soon.
- Nickname updates use real Supabase metadata/profile synchronization. Member QR codes contain only the user's member ID, never credentials or order information. Size/student sections were not added.
- Support icons navigate to /support. The assistant uses the existing OpenRouter key server-side, Gemini 2.5 Flash Lite and low reasoning effort; actual runtime AI requests were not tested. It is read-only and cannot claim to cancel orders or issue refunds. No admin-only records enter its context.

## Noindex and hosting

Private routes add noindex/nofollow/noarchive/nosnippet metadata. index.html adds robots metadata early for private paths. Vite development and Preview servers set X-Robots-Tag for private paths; Edge Function JSON responses also set noindex headers. The production OnSpace static host's HTML response headers could not be configured or verified with the available tools. If strict server-level private-path headers are required, configure X-Robots-Tag on the deployed host. The secret URL is never treated as authentication.

## Required follow-up verification

| Requested test | Actual session result |
|---|---|
| Storefront API connectivity + small product sample | Passed live GET health |
| Founding admin allowlist / RLS grant isolation | Passed SQL inspections/assertions |
| berryxoe browser admin entry | Not exercised |
| dawiniefleury07 browser admin entry | Not exercised; Auth account not yet present |
| Unauthorized direct admin API request after deployment | Not exercised; source enforces 404 before operations |
| Full catalog pagination / all variants | Source present; full live test not run |
| Product create/update/publication | Source present; live mutations not run |
| Image/video staged upload and processing | Not run |
| Vendor display/visibility saves | Not run |
| Analytics correctness against actual paid orders | Not run; no synchronized order records observed |
| Webhook registration/delivery/payment feed | No webhook events observed; registration not freshly verified |
| Admin token refresh after expiration | Not run; healthy token metadata observed only |
| Cart mutations / real checkout transition | Existing source preserved; not exercised |
| Own-order tracking/receipt | Not exercised; no synchronized orders observed |
| Invite email, acceptance, revoke and custom roles | Database/source present; mail/browser workflow not exercised |
| Google / Apple OAuth | Source preserved; configuration/browser cases not exercised |
| OpenRouter support | Source present; model request not exercised |
| Production TypeScript/Vite build | No shell/build tool; not run |
| Mobile/desktop browser interaction tests | Not run |

## Manual configuration and next actions

1. Publish/deploy through OnSpace, then confirm the three new Edge Functions and updated Shopify functions are present in Cloud → Edge Functions. Check function logs and /integration.
2. Sign in with berryxoe@gmail.com and open the private URL. Complete normal email signup/verification for dawiniefleury07@gmail.com before testing that account.
3. Check fresh Admin connection status rather than relying on the old cached setup failure. Shopify Client Credentials Grant requires an installed eligible app/store organization relationship. Non-JSON upstream errors are now reported explicitly without exposing response bodies or secrets.
4. Verify actual Shopify read/write product, inventory, files, publication, customer, order and fulfillment permissions; older order access may require read_all_orders approval. No missing scope is asserted without a live operation result.
5. Ensure the Shopify Headless Customer Account public PKCE client permits the deployed origin and /shopify/callback URL. Verify webhook registration and send actual signed events; zero deliveries were observed here.
6. Enable Google and Apple in Cloud → Users → Auth Settings and configure the displayed provider callback in Google Cloud / Apple Developer. Preview and default publish redirect entries are automatically configured; custom domains need their allowed `https://YOUR-DOMAIN/**` entries. Live Preview uses PKCE popup code relay with postMessage target '*', never token relay.
7. Ensure Auth email templates include the existing four-digit OTP token. The email-first and reset flows depend on actual deliverable email codes; notification preference storage does not implement transactional email notification delivery.
8. Existing token-monitor GitHub schedule still needs corresponding GitHub Actions secrets if not already configured; Cloud secrets are not automatically GitHub secrets. Refresh-on-use remains implemented independently.
9. Verify OpenRouter account credit/model access using the existing key. No provider key was requested, duplicated or exposed.
10. Complete the live test matrix above before describing the entire platform as production-tested or fully verified.
