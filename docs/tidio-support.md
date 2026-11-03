# Tidio customer support setup

Dah Glow uses Tidio's official website widget for customer chat and the Tidio OpenAPI for the administrator's read-only live-chat view. Human chat replies and conversation management remain in Tidio Inbox because the documented contact-message API does not send operator messages.

## Required Tidio access

- Install the Tidio widget for the Dah Glow website and copy its **public project key**.
- Enable OpenAPI and create a client ID/secret in **Tidio Panel → Settings → Developer → OpenAPI**. Contact, message, and operator endpoints require Tidio Plus or Premium.
- Enable Webhooks in **Tidio Panel → Settings → Developer → Webhooks**. Webhooks also require Plus or Premium. Configure the endpoint and signing secret as described below.
- Configure Lyro/AI knowledge and human handoff rules in Tidio itself. The website's **Talk to a Human** action sends a visitor message through the official widget SDK; it does not claim an operator has joined. Tidio reports handoff/solved events when those events occur.
- Tidio Lyro is not connected by this code to Dah Glow's live Shopify catalog or authenticated order lookup. Until a Tidio-supported product/catalog integration is configured and verified in Tidio, use the existing `/support` assistant for current product availability, pricing, and private order information; do not train Lyro on stale inventory or claim it can verify orders.
- The Contact Us page's **Chat With Support** button only opens the official widget. It does not claim an operator is available or create a conversation by itself. The existing `/support` handoff action sends a visitor-authored request through the documented widget SDK.
- Contact-form submissions are stored separately from Tidio in `dg_contact_requests`. They are not automatically copied into Tidio or represented as a Tidio conversation.

## Contact form and support queue

Apply the `202611030002_contact_requests.sql` migration before deploying the Contact Us page and updated support Edge Functions. The form posts to the existing `dah-glow-support` function, which validates fields server-side, rejects the honeypot, rate-limits by hashed IP and email using `dg_rate_check`, and inserts using the service role. Direct `anon` and `authenticated` table access is revoked.

Support users can review and update request status in the **Contact form requests** section of the admin Support dashboard. The dashboard polls while open and shows a toast for newly received requests. Dah Glow currently has no configured outbound email provider, so submissions are not emailed automatically; an administrator must review the queue and contact the customer using the supplied email address. Contact email and phone shown publicly are read from **Admin → Store** settings. No business address or operating hours are displayed unless verified and configured separately.

Shipping and return FAQ content is loaded from Shopify's published store policies. If a policy is missing or cannot be loaded, the page says so rather than supplying an unverified answer. Cancellation instructions are limited to requesting review; no cancellation policy is configured.

## Environment and secrets

Set `VITE_TIDIO_PUBLIC_KEY` in the frontend build/deployment environment. It is intentionally public: Tidio's widget requires the key in the browser. Rebuild and redeploy after changing it.

Set these server-side Supabase Edge Function secrets; do not put them in Vite variables or browser code:

```text
TIDIO_CLIENT_ID
TIDIO_CLIENT_SECRET
TIDIO_PUBLIC_KEY
TIDIO_WEBHOOK_SECRET
```

`TIDIO_PUBLIC_KEY` must be the same project key used by the widget. `TIDIO_WEBHOOK_SECRET` is the signing secret for the configured Tidio webhook. Existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are already used by the Edge Functions. `TIDIO_PROJECT_ID` is not required by the documented endpoints used here.

Example secret setup (supply real values in your own terminal or deployment secret manager):

```sh
supabase secrets set TIDIO_CLIENT_ID=... TIDIO_CLIENT_SECRET=... TIDIO_PUBLIC_KEY=... TIDIO_WEBHOOK_SECRET=...
```

## Webhook configuration

After deploying the `tidio-webhook` Edge Function, configure this URL in Tidio:

```text
https://<supabase-project-ref>.supabase.co/functions/v1/tidio-webhook
```

Subscribe only to documented topics needed by the integration:

- `contact.created`
- `contact.updated`
- `conversation.operator_replied`
- `conversation.solved_by_operator`
- `conversation.solved_by_lyro`
- `conversation.solved_automatically`
- `ticket.created`
- `ticket.status_updated`
- `ticket.operator_assigned`

The endpoint verifies Tidio's `x-tidio-signature` HMAC-SHA256 signature against the exact request body, checks a six-hour timestamp window (to allow Tidio's documented retry schedule) and project key, and deduplicates events by `webhook_id`. It stores event metadata only; conversation messages remain in Tidio. Visitor-authored live-chat messages are not a documented webhook topic, so the selected conversation is polled from the official messages endpoint instead.

## Dashboard behavior and API limits

- The global customer widget is loaded only on customer-facing routes, not in the private admin workspace.
- The Live Chat dashboard is gated by the existing `support` permission. A `support_agent` role is added by the migration; assign it through the existing admin-management flow.
- The dashboard lists contacts, loads a selected contact's message history and `conversation_url`, and displays supported operator and webhook data. It polls contact/message/event data because the API does not offer a visitor-message webhook. When the dashboard is open, it shows toast notifications for verified Lyro handoffs and operator replies; it cannot notify for visitor messages that Tidio does not send as webhooks.
- Tidio's documented `POST /contacts/{contactId}/messages` sends a message **as the contact**, not as a human operator. Therefore Dah Glow does not use it to reply to customers. The dashboard links to the official Tidio Inbox for chat replies, assignment, unread state, and conversation management.
- The listed contact endpoint does not include a last-message preview, chat unread count, chat assignment, or a full live-chat state. The dashboard does not invent these values.
- Customer order details are not matched to Tidio contacts by email alone. Customers can use the existing authenticated Dah Glow support assistant for verified order information.
- Tidio's ticket reply endpoint is a separate, documented API capability; this Live Chat view does not implement a ticket inbox.
- Tidio OpenAPI has plan-based limits (60 requests/minute on Plus and 120/minute on Premium). `429` responses are surfaced, and transient read failures receive one retry. Message writes are not retried automatically.

## Official references

- [OpenAPI authorization](https://developers.tidio.com/docs/openapi-authorization)
- [OpenAPI plan availability](https://developers.tidio.com/docs/openapi-enable)
- [Contacts](https://developers.tidio.com/reference/get_contacts)
- [Contact messages](https://developers.tidio.com/reference/get_contacts-contactid-messages)
- [Operators](https://developers.tidio.com/reference/get_operators)
- [Widget SDK](https://developers.tidio.com/docs/widget-introduction)
- [Widget visitor messages](https://developers.tidio.com/docs/widget-other-methods)
- [Webhook events](https://developers.tidio.com/reference/events)
- [Webhook signature verification](https://developers.tidio.com/docs/webhooks-signature-verification)
