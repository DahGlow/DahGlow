
# Dah Glow desktop storefront and real visual search

## Implemented

- Desktop-only black commerce header with centered search, functional account/cart/wishlist/support controls and a language/currency dialog. Currency preferences do not invent converted prices.
- Desktop home has three image tiles on each side of the existing four-slide center carousel. The supplied images are used as backgrounds. DawineStore and DawensStore resolve to real vendor routes where available; otherwise they open a vendor-filtered catalog. The bag tile is named The Bag Edit.
- Each carousel slide uses a different pair of real products from the newest 12-product catalog response. If insufficient products exist, cards are omitted rather than repeating or inventing products.
- Sixteen desktop category entries, three catalog feature panels, a responsive product grid and a desktop footer. Footer policies come from Shopify; social links come from real store settings. Newsletter actions save authenticated email consent in the existing contact-preferences table; they do not pretend to send email. No unavailable native app downloads or unsupported payment methods are advertised.
- Mobile mail controls navigate to `/messages`. Membership graphics use the supplied image URLs without promising fictitious membership discounts. Actual order notifications are created by verified webhook events for linked customer orders. Messages use owner-only RLS and 30-second polling; customers can update only `read_at`.
- Missing `src/pages/ContactPreferences.tsx` was created to fix the existing unresolved lazy import and reuse the existing secure preference hook.

## Recognition service and catalog

**Service:** OnSpace AI, `google/gemini-3-flash-preview`, through the injected `ONSPACE_AI_BASE_URL` and `ONSPACE_AI_API_KEY` on the server. The default multimodal model from the platform guidance is used. No OpenRouter, Hugging Face or other provider key is added to the frontend. The already-configured OpenRouter key is not used by visual search.

**Free-tier caveat:** This is a managed workspace AI service, not a guaranteed free API. Recognition and ranking consume workspace AI credits according to its allowance and billing. No unverified free-tier claim is made and no extra paid provider account is required. A self-hosted CLIP service cannot run as a traditional model server in this project's serverless-only runtime, so it was not represented as available.

**Data source:** The connected Shopify Storefront API, with existing private product/vendor visibility controls. No external product search, web scraping, invented prices, catalog IDs, brands, availability or URLs.

## Actual scan pipeline

1. JPG/PNG/WebP upload or device camera capture, maximum original file size 5 MB. HEIC must be exported as JPG. Camera availability depends on the device/browser.
2. Browser decodes and resizes the photo to at most 1600 pixels, removing original metadata by re-encoding JPEG. Decode failures are shown as errors.
3. A multipart request goes to `product-image-scan`. The function enforces size, MIME/signature checks, CORS and IP-based rate limiting (5 recognition calls / 15 minutes; 10 comparison calls / 15 minutes). Uploaded data is held in memory, never written to a public storage bucket or database.
4. Actual multimodal inference identifies up to five products, categories, confident readable brands, visible label text and visual attributes. Invalid model responses or no detected products are not turned into mock scans.
5. A server-encrypted, ten-minute ticket binds the recognition to the uploaded image hash. Comparison rejects altered images or forged/expired tickets.
6. Shopify searches produce up to 200 query candidates, with up to 200 additional fallback records if fewer than 12 query results exist. Hidden products/vendors are excluded.
7. Attribute relevance selects at most 48 candidate images. Three batches of up to 16 catalog images are **actually compared visually** with the uploaded image by the recognition service. Matching is not keyword-only. The server accepts only IDs in each real candidate batch, deduplicates and ranks returned similarity estimates, and returns up to 24 matches (server configurable 1–36).
8. Every returned item is conservatively labeled **Visually similar**. Image-only inference does not verify exact identity; no fabricated exact-match badge is added. Shopify vendor is shown as catalog vendor, not invented manufacturer data.
9. The results show the uploaded photo, detected products, per-object filtering, real prices/availability, working `/products/:handle` links, scope limitations and another-scan/retry actions. Photos/results remain in tab memory and are cleared on refresh.

**Reliability:** 45-second timeout per inference call, independent rate-limit and service-error states, validation of JSON responses and catalog IDs. A failed recognition or comparison yields an actionable error, not fallback fake products. Backend logs contain object/match counts and error categories, never image bytes, tickets or API credentials. Closing a scan cancels local display, not necessarily a request already running at the provider.

## Admin storage

The live database was inspected: `dg-branding` already exists, is public, permits JPG/PNG/WebP and has a 5 MB limit. The migration ensures it exists idempotently without changing or deleting any existing records. Existing store/vendor/settings policies are preserved; an additional policy permits product admins to upload. Frontend upload errors now distinguish missing buckets, insufficient admin permissions, unsupported formats, size limits and transport timeouts. Product media continues to upload directly to Shopify, not the branding bucket.

No failing admin upload was present in the available network/Postgres logs, so its exact prior cause is not established. Actual authenticated admin upload must still be tested.

## Shopify webhook 401 corrections

- `verify_jwt = false` is preserved and the function is explicitly enabled. Shopify POSTs do not carry Supabase JWTs; authentication is raw-body Shopify HMAC, not an unauthenticated bypass.
- App/API-created subscriptions verify against `SHOPIFY_CLIENT_SECRET`, as specified by Shopify. Manually created Notifications subscriptions can additionally verify against the already-configured `SHOPIFY_WEBHOOK_SECRET`. No signing secrets are exposed or logged.
- Callback generation forces HTTPS. Automatic setup upgrades matching HTTP subscriptions to HTTPS without deleting unrelated subscriptions, and uses a new setup cache key.
- Invalid signatures remain 401 with `SHOPIFY_SIGNATURE_INVALID`; invalid headers remain 400. Successful verified events keep the existing durable claim/deduplication and order synchronization.
- A public GET receiver-health response distinguishes a reachable function from gateway rejection without exposing order or admin data.

**Important:** The reported 401s were visible in gateway logs. Code fixes cannot prove the gateway is honoring deployment configuration; a fresh real delivery is required. If it still returns a missing-JWT 401 before the function, the deployment/gateway must apply `verify_jwt=false`; contact `contact@onspace.ai` if OnSpace does not honor it. Do not add service-role keys to webhook URLs, disable HMAC or create an insecure proxy. App-secret rotation can take up to an hour to propagate in Shopify.

## Tests and checks actually performed

- Read the existing frontend, Edge Functions, upload utilities, webhook infrastructure and SQL policies.
- Queried live storage configuration and verified the branding bucket, allowed MIME types and size limit.
- Executed the additive messages/storage SQL successfully; verified message RLS and that authenticated UPDATE privileges are limited to `read_at`.
- Queried webhook logs: repeated 401s were reported. No related failing admin upload or Postgres error was available in the returned logs.
- Queried the live Shopify health endpoint successfully: storefront connected, with actual product handles and available variants.
- Added `scanValidation.test.ts` covering file signatures, unsupported/empty data, detection response structure, five-object limits and bounded confidence.

**Not performed:** A build/test runner, browser automation, POST-capable HTTP tester and physical camera are unavailable in this editing environment. The added Deno tests have not been executed. No live image upload/recognition/ranking result, negative service test, authenticated admin upload or new signed Shopify webhook delivery is claimed to have passed. End-to-end verification remains pending; the implementation is real backend code, not a tested-production claim.

## Release verification checklist

1. Build the frontend and run `deno test --allow-env --allow-net supabase/functions/_shared/scanValidation.test.ts` in a suitable environment.
2. Open desktop home at 1024/1366/1600 px; inspect mobile at 390 px. Check header icons, all six edit links, distinct carousel product pairs, category filters and footer policies/consent.
3. Open `/scan-product` through the search camera. Upload an actual Shopify product image or click a catalog-image example; confirm both multipart calls return valid data and the AI/backend logs show real recognition/comparison counts.
4. Capture a photo on a physical phone. Confirm permission denial/unsupported formats are explained, not silently accepted.
5. Test multiple products, a non-product image, an unavailable catalog product and a clear photo with no relevant catalog match. No products must be invented.
6. Test an oversized file, fake MIME/file extension, a corrupt image, an expired or altered ticket, network timeout, provider failure and rate limits. None may report a successful scan with fake data.
7. Open every returned product link, confirm current Shopify price and availability and retry/scan-another behavior. Compare a truly similar image with unrelated images.
8. Upload JPG/PNG/WebP as an authorized admin, confirm save and URL, then attempt as a normal customer. Normal-customer upload must fail.
9. Trigger a real Shopify product/order update. Confirm the HTTPS delivery reaches the function, HMAC validates, status is 200 and the event is processed once. For linked orders, verify only the owner can read the new message. Invalid signatures must still fail.
10. Refresh/reopen results and switch accounts to verify private photos/messages are not exposed across sessions.
