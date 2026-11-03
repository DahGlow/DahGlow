# Dah Glow Shopify implementation report

Later private-admin and customer-workflow delivery details, current SQL checks, live connection observations and remaining tests are recorded in `docs/PRIVATE_CONTROL_DELIVERY.md`; the original session notes below are historical.

Date: 2026-11-02

## Verified in this editing session

- OnSpace Cloud was ready and the existing store/follow/profile structure was inspected.
- New database tables, RLS policies, indexes and atomic token/webhook lease functions were applied successfully using the SQL tool.
- SQL permission verification returned: anonymous token-table read = false; authenticated token-table read = false; service-role token-table read = true.
- Source pattern checks found no demo PRODUCTS/SHUFFLED_PRODUCTS imports remaining in src, no service-role references in src, and no Shopify client-secret references in src.
- Existing circular category image URLs in CategoryCircles.tsx were not replaced.
- Existing Cloud credentials were not replaced, requested again, or copied into frontend code.

These source/database checks are not equivalent to a successful production build, Shopify API test, or completed checkout.

## Edge Functions

Source created for:

- shopify-storefront: allowlisted catalog, full product image/variant pagination, real recommendations, predictive search, vendor directory, policies, real Cart API and connection diagnostics.
- shopify-admin-auth: client-credentials grant, encrypted persistent access token, expiry metadata, refresh lease, replacement verification; service-role-only invocation; no token in response.
- shopify-token-monitor: refresh-on-use check, real Admin shop query and setup health; service-role-only invocation.
- shopify-webhook: raw-body HMAC-SHA256 verification, shop/topic validation, event deduplication with retry recovery, current-source order synchronization and catalog cache invalidation.
- shopify-customer-account: public-client PKCE and OIDC nonce/JWKS verification, encrypted refresh/access tokens, verified customer associations and own-order synchronization.
- shopify-setup: service-only diagnostics and explicit webhook registration.

Configuration: supabase/config.toml. Source is in supabase/functions/. Shared code is in supabase/functions/_shared/.

Deployment status: NOT VERIFIED. The editor's live-log tool could not find the newly created Storefront function during this session. The attempted public endpoint fetch returned no usable response. No dedicated deployment or shell execution tool was available. Function files are prepared for OnSpace's deployment pipeline, not falsely reported as already tested/deployed.

## Credentials mapped, not replaced

- SHOPIFY_STORE_DOMAIN: canonical *.myshopify.com domain.
- SHOPIFY_STOREFRONT_PRIVATE_TOKEN: server-only preferred Storefront token.
- SHOPIFY_STOREFRONT_PUBLIC_TOKEN: existing fallback, still used server-side.
- SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET: real Admin OAuth; Client Secret also supplies HKDF input for encrypted server persistence.
- SHOPIFY_WEBHOOK_SECRET: existing webhook signing secret; must match the app/webhook configuration that delivers these events.
- SHOPIFY_API_VERSION: existing configured version; code fallback is 2026-10.
- CUSTOMER_ACCOUNT_API_CLIENT_ID: existing public Customer Account client.
- SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY: server persistence and secure function authorization.
- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY: existing, platform-generated browser configuration; src/lib/api.ts was preserved.

The .env file could not be read by the editor tool. Secret values were not inspected or logged. Runtime functions obtain existing values with Deno.env.get(). Verify that the platform-generated VITE variables are available to the frontend build.

No supported API for mutating OnSpace Cloud Secrets at runtime was exposed. The implementation therefore uses an AES-GCM encrypted private database token record rather than pretending environment secrets can be changed. Client-secret rotation automatically causes Admin-token regeneration; existing customer-account connections may require reconnection after such rotation.

## Database migration

Applied and saved as supabase/migrations/202611020001_dah_glow_shopify.sql.

New tables:

1. dg_shopify_tokens
2. dg_shopify_cache
3. dg_webhook_events
4. dg_customer_accounts
5. dg_customer_flows
6. dg_orders
7. dg_order_preferences
8. dg_wishlists
9. dg_coupons
10. dg_points

New functions: dg_acquire_token_lease, dg_claim_webhook.

All new tables have RLS. Private persistence has no browser policies and explicit browser-grant revocation. Customer-facing tables have own-user policies. Coupon and points issuance is not exposed to browsers. No fake coupons or points were seeded. No user data was deleted by migration tools.

Shopify remains the source of truth. Media stays in Shopify; only URLs are stored. Cache persistence skips responses >=100KB. Larger product responses are returned from Shopify instead of stored as large database text.

## Files created or modified

Frontend:

- src/App.tsx, src/main.tsx, src/index.css, src/types/shop.ts, src/constants/products.ts
- src/constants/categoryVisuals.ts
- src/lib/shopify.ts, src/lib/images.ts, src/lib/metafields.ts
- src/hooks/useShop.tsx, useCatalog.ts, useCart.ts, useCloudWishlist.ts, useSavedProducts.ts, useDebounce.ts, useRecentlyViewed.ts, useCustomerAccount.ts, useCustomerBridge.ts, useOrderArchive.ts, useRewards.ts, usePageMeta.ts
- src/components/layout/Header.tsx, BottomTabs.tsx, SideMenu.tsx, ProductHeader.tsx, ScrollReset.tsx
- src/components/features/ProductCard.tsx, HeroBanner.tsx, TrendsHero.tsx, StoreCard.tsx, ShippingBenefits.tsx, MemberCards.tsx, AccountServices.tsx, InfoModal.tsx
- src/components/features/GlowDialog.tsx, BottomSheet.tsx, ProductGallery.tsx, VariantSelector.tsx, ProductDescription.tsx, CatalogResults.tsx, CustomerBridge.tsx, OrderCard.tsx, OrderMoreMenu.tsx, IntegrationReport.tsx
- src/components/forms/FindOrderForm.tsx
- src/pages/Shop.tsx, Trends.tsx, ProductDetail.tsx, Search.tsx, Cart.tsx, Wishlist.tsx, Me.tsx, SuperDeals.tsx, Settings.tsx, Preferences.tsx
- src/pages/BlackFriday.tsx, VendorStore.tsx, ShopifyCallback.tsx, Orders.tsx, OrderDetail.tsx, FindOrder.tsx, OrderRecycleBin.tsx, Coupons.tsx, Points.tsx, IntegrationStatus.tsx
- src/assets/black-friday.jpg

Backend:

- supabase/config.toml
- supabase/migrations/202611020001_dah_glow_shopify.sql
- supabase/functions/{shopify-storefront,shopify-admin-auth,shopify-token-monitor,shopify-webhook,shopify-customer-account,shopify-setup}/index.ts
- supabase/functions/_shared/{cors,config,crypto,shopifyAdmin,storefront,cache,customer,orders,bootstrap,metafieldRegistry}.ts

Operations:

- .github/workflows/shopify-token-monitor.yml
- docs/SHOPIFY_INTEGRATION_REPORT.md

The local src/components/ui/dialog file was absent. A Radix-backed, shadcn-style wrapper was created outside the read-only ui directory; no read-only library files or package manifests were modified.

## User-facing changes

- Smaller home banner and tighter spacing below mobile header icons; existing category circles preserved.
- Every main banner tap opens /black-Friday-2026-November-dah-glow.
- Real /products/:handle gallery, variant prices, selected-option images, swatches, dynamic sizes, quantities, full-description bottom sheet and fixed heart/Add to Cart bar; mobile tabs hidden on product details.
- Real catalog pagination, published-product-only empty states, Shopify search/predictive suggestions, and actual vendor-only storefront queries.
- /stores/:slug uses collision-resistant vendor slugs, temporary vendor-profile photos, purple vendor header, sorting/search and existing Cloud follows.
- Real Cart API create/add/update/remove/get, persisted cart ID, selected variants and real Shopify checkoutUrl transition.
- Compact square account panels, smaller icons/labels, full-width wishlist/recently viewed panel, real points/coupon data, and Cloud wishlist merge for guest product handles after sign-in.
- /us/user/orders/list, /us/user/orders/detail/:id, /us/user/orders/find and /us/user/orders/recycle-bin.
- Find Order searches only the customer's verified Shopify orders. An order/tracking number alone is not authentication. Phone, email and payment lookup intentionally show the requested coming-soon notices.
- Recycle bin archives only the Dah Glow list; it does not delete/cancel the Shopify order.
- /us/user/coupons, /us/user/points, /shopify/callback and /integration.

## Shopify API / checkout test results

| Check | Session result |
|---|---|
| Storefront authentication | Not tested against live credentials |
| Real product load / full pagination | Implemented; live test not performed |
| Variant image / size / color selection | Implemented; live Shopify product test not performed |
| Metafields | Common fields plus public definition registry implemented; live permissions not verified |
| Search / vendors | Implemented; live search/vendor test not performed |
| Cart create/add/update/remove | Implemented; no live cart mutation performed |
| Shopify checkoutUrl redirect | Implemented; not exercised |
| Paid checkout / payment | Not performed; no success simulation |
| Admin token generation | Implemented; live grant not performed by editor |
| Token refresh after expiry | Implemented; not exercised |
| Webhook registration | Automatic backend setup is implemented; registration not verified |
| HMAC verification / retry deliveries | Implemented; live test events not delivered |
| Paid orders / fulfillments / tracking sync | Implemented; no live events observed |
| Customer Account PKCE | Implemented; browser login/configuration not verified |
| Production build / browser bundle audit | No build execution tool; not run |

Use Settings → Shopify connection status, or /integration, after the functions are deployed. It makes real backend requests and displays actual connection/setup responses rather than fabricated passed checks. On first catalog/health access, the backend attempts Admin authentication, webhook registration, and public metafield registry discovery. Permission failures are reported.

## Remaining manual configuration / verification

1. Confirm function deployment in OnSpace Cloud → Edge Functions. Deploy/publish the current project using OnSpace's pipeline, then open /integration.
2. Confirm the Shopify app is installed on this store and eligible for Client Credentials Grant. Shopify requires the app and store to belong to the same organization for this grant; errors such as shop_not_permitted are not hidden.
3. Verify Storefront scopes for product listings, inventory quantity and checkout/cart access. Products must be published to the relevant Headless/Storefront channel.
4. Verify Admin permissions for products, orders, inventory and fulfillment events; older orders can require read_all_orders approval. Verify protected customer data access for orders/addresses. Scopes have not been asserted missing without a live response.
5. Enable new Shopify customer accounts, configure the existing CUSTOMER_ACCOUNT_API_CLIENT_ID as a public PKCE client, and allow each deployed origin and https://YOUR-DOMAIN/shopify/callback in Shopify Headless Customer Account API settings. This is separate from Google/Apple Supabase callbacks.
6. Ensure SHOPIFY_WEBHOOK_SECRET matches the signing secret of the same app that creates these webhook subscriptions. Check registration statuses at /integration, then send actual signed test events and confirm delivery logs.
7. PostgreSQL inspection found no supported HTTP scheduling extension; pg_cron was not installed and pg_net/http were not available. A GitHub Actions schedule was added for every 30 minutes. OnSpace Cloud secrets are not automatically GitHub secrets: configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in GitHub Actions using the same names, without changing the existing Cloud credentials. Until then only refresh-on-use runs automatically.
8. The pre-existing Oxygen workflow calls shopify hydrogen deploy. This React/Vite app is not a Hydrogen/Oxygen SSR app. That workflow was not silently converted; use OnSpace Publish or separately replace/disable it.
9. Shopify-hosted checkout/order status controls return behavior. No arbitrary post-payment redirect has been assumed. Customers return to Dah Glow Orders and connect their verified Shopify account.
10. Run the live test matrix above before treating the store as production-verified. Populate real coupon/point entitlements through trusted store administration only; no cash redemption rate or reward rules were invented.

## Customer token refresh lifecycle

Apply `supabase/migrations/202611030003_customer_refresh_rotation.sql` before deploying the updated `shopify-customer-account` Edge Function. Customer token refresh uses the shop's discovered OpenID `token_endpoint` and the same public client ID used for authorization. Refreshed access and rotated refresh tokens are sealed and saved together under a database lease; a stale lease owner cannot overwrite a newer token pair. Shopify `invalid_grant` marks the existing account session as `reauth_required` without removing the customer association or order records. The Orders page then prompts the customer to reconnect.

The lifecycle unit tests can be run with `node --experimental-strip-types --test supabase/functions/_shared/customerTokenLifecycle.test.ts`. They cover initial token validation, refresh-token rotation, simultaneous requests, invalid-grant reauthentication, and the refresh grant parameters. Shopify documents that only customer-account clients configured on the shop receive refresh tokens; app-configured customer-authentication clients need a fresh PKCE authorization flow instead. See [Customer Account API authentication](https://shopify.dev/docs/api/customer/latest#authentication).

## Known boundaries

- Backend Realtime is unsupported; React Query polling and webhook invalidation are used.
- Search displays the number of loaded results plus '+' when more pages exist, not an invented complete result count.
- Currency preference is stored, but prices display Shopify's actual currency; market-based currency conversion is not simulated.
- Public product metafield discovery depends on Admin permissions and Storefront PUBLIC_READ exposure. More than 250 identifiers is reported as configuration required, not silently claimed supported.
- Review, wallet, gift-card services and phone/email/payment order lookup have no invented transactional results.
- No credentials, Admin tokens or customer tokens are intentionally exposed in browser responses. Existing .env values and the compiled bundle could not be inspected in this session.
