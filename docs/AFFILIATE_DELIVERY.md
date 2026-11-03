
# Dah Glow Affiliate workspace

## Applied database setup
The SQL tool applied vendor `profile_url`, customer refresh columns and lease RPCs, Contact Request and Tidio event schemas, and the restricted branding UPDATE policy. Existing customer records, stored credentials, orders and role permissions were not overwritten. `support_agent` was inserted only if absent. Existing super administrators receive support access through the server authorization code without rewriting role records.

The affiliate migration creates private profiles, unique per-user affiliate IDs/referral codes, saved picks, public social links, promotion links, click attribution, verified earnings and withdrawal bookkeeping. All tables have RLS. Browsers can select their own profile/picks/social/links/earnings/withdrawal records only; writes and attribution events are handled by the Edge Function. No fake $2 balance, unearned bonus, fake testimonials, coupon percentages or campaign deadlines were seeded.

## Pages
- `/affiliate`: creator overview, balance/referral code, tools, product/campaign tabs, real products.
- `/affiliate/items`: Cloud Picks, actual Shopify cart, verified Shopify orders and existing wishlist.
- `/affiliate/boost`, `/affiliate/bonus`, `/affiliate/earnings`, `/affiliate/data`.
- `/affiliate/convert`, `/affiliate/social`, `/affiliate/account`, `/affiliate/account/settings`.
- `/r/:code` and `/r/:code/:linkId`: public referral landing pages with disclosure, real creator picks and product-specific destinations.

Normal shop tabs/headers/footer are hidden within the affiliate workspace and referral pages. Affiliate navigation is separate. Rules use a mobile bottom sheet / desktop modal. Public social URLs are saved and can be opened; they are visibly unverified, not falsely represented as OAuth-authorized.

## Referral and commission behavior
The `dah-glow-affiliate` function provides authenticated enrollment, pick/profile/social writes, server-validated product-link conversion, public code lookup and referral resolution, rules and polling analytics. Referral visits snapshot promoted product handles. Last eligible click supersedes earlier attribution; 24-hour expiry is enforced in the database. Cart creation and cart updates carry the validated visit attribute through Shopify checkout. Signed Shopify order webhooks fetch the current Admin API order, exclude self-referrals and invalid/returned/refunded/cancelled orders, use discounted product revenue only, and serialize ledger caps in Pacific Time. The Admin API `priceAfterAllDiscountsBeforeTaxesSet` field supplies net eligible revenue after all discounts and before taxes. Complete, successful shipment delivery timestamps begin the 45-day verification period. Non-USD orders are not silently converted into USD commission.

Commission rates default to unconfigured, and commission accrual defaults to disabled. Store-permission administrators can configure rates and enable accrual in Private Control > Store > Affiliate Program. No rate was invented from the reference screenshots. Payouts remain disabled: there is no fake bank/PayPal transfer, tax verification or social authorization. A supported secure payout provider and social OAuth app credentials/approval require a separate configuration task.

Cloud mutations invalidate caches immediately; picks, balances and analytics poll every 15 seconds. The platform does not support database Realtime. Shopify catalog data keeps its existing cache behavior. Adding an item to the cart also saves it as a pick for an already-enrolled affiliate; multi-option products open the product page to choose a valid variant.

## Storage fix
The existing branding INSERT policies were retained. A separate UPDATE policy now permits Storage upsert only for existing authorized store/vendor/settings/product editors. Browser grants were not opened to all users. The app upload helper continues to use unique keys and `upsert:false` and now reports permission/configuration failures with an actionable message. Do not make the entire bucket publicly writable to work around RLS.

## Verification boundaries
The pending schema SQL and permissions were executed and inspected in this editor. Read-only checks verified RLS on all eight affiliate tables, private reporting/ledger RPC grants, no browser ledger INSERT, and the branding UPDATE policy. Reporting RPCs returned zero balances and seven daily entries for a non-existent identity without writing any data. The Tidio widget can retrieve its public embed key from the existing server-side TIDIO_PUBLIC_KEY, without exposing client secrets. Function deployment and browser/Shopify checkout flows still require verification after the OnSpace deployment pipeline runs. No shell/build runner is available in this editing session; no successful production build or live payout/OAuth completion is claimed. The payment-rule unit test is available at `supabase/functions/_shared/affiliateRules.test.ts` (`node --experimental-strip-types --test supabase/functions/_shared/affiliateRules.test.ts`), but was not executed by the editor. Test code creation/reloading, two-user referral flows, product-specific conversion, wishlist/cart/order tabs, order webhook retries, USD accrual, refund disqualification, actual-delivery timestamps, mobile sheet/desktop modal behavior and restricted vendor image uploads before production launch.

Apply the saved migrations for other environments; the current Cloud database has already received the corresponding non-destructive schema setup. Existing token values were not read or logged.
