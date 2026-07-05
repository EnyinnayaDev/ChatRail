# ChatRail Usage Guide

ChatRail is a demo order-taking system for WhatsApp-style chat commerce. It turns an informal customer message or voice note into a structured order, lets a merchant approve the order, generates a payment link, and then tracks payment and delivery live.

## Who Uses It

- Customer: starts the order in the chat sandbox.
- Merchant: reviews and manages orders in the dashboard.
- Realtime service: keeps both screens in sync through WebSocket updates.

## End-to-End Flow

### 1. Customer starts in the chat sandbox
Open the chat experience in `frontend-chat-sandbox`.

The chat sandbox opens directly into a WhatsApp Business-style conversation. It is intentionally customer-facing only and does not include login or register screens.

The customer can:
- type a message describing what they want to buy, or
- record a voice note and send it.

Example request:
- "Abeg send two medium black tracksuits to FUTO front gate"

### 2. The message is parsed into an order draft
The chat sandbox sends the message to the AI parser in `ai-engine`.

The parser extracts:
- items and quantities
- size or color if mentioned
- delivery address
- delivery type
- confidence level

If something is missing, the chat asks a follow-up question instead of creating the order immediately.

### 3. The draft order is saved for the merchant
Once the order draft is complete, the chat sandbox sends it to `backend-core`.

`backend-core` stores the order in the shared database with status:
- `pending_approval`

At this point the customer sees that the order has been captured and queued for approval.

### 4. The merchant reviews the order in the dashboard
Open `frontend-dashboard`.

The merchant first sees a simple login/register screen. In the current prototype, this is a lightweight browser-based gate that stands in for the future merchant auth system.

The merchant sees all orders grouped into kanban columns:
- Pending Approval
- Awaiting Payment
- Paid
- Out for Delivery
- Delivered

The merchant can open an order to review:
- the item list
- delivery address
- captured chat text
- current status

### 5. The merchant approves the order and sets a price
From the order detail panel, the merchant enters the total amount and approves the order.

This updates the order in `backend-core` to:
- `awaiting_payment`

`backend-core` also generates the OPay payment link and reference.

### 6. The customer receives the payment link live
The chat sandbox listens to `backend-realtime` over WebSocket.

When the order moves to `awaiting_payment`, the customer screen updates automatically and shows the payment card with:
- amount
- OPay payment link
- payment reference
- the secured payment banner

No polling is needed.

### 7. Payment confirmation arrives through the webhook
After payment, `backend-realtime` receives the OPay webhook.

It verifies the payment details and updates the order to:
- `paid`

Both the dashboard and chat sandbox update live.

### 8. The merchant assigns a rider and marks delivery
In the dashboard, the merchant can move the order forward:
- assign a rider, which sets the order to `out_for_delivery`
- mark the order delivered, which sets the order to `delivered`

These actions are also broadcast live through `backend-realtime`, so the customer sees the status changes immediately.

## What The Customer Sees

From start to finish, the customer journey is:
1. Open the chat sandbox directly.
2. Send an order by text or voice.
3. Receive a structured order confirmation.
4. Wait while the merchant approves it.
5. Receive a payment link.
6. Pay through OPay.
7. See payment confirmation.
8. See delivery progress and final delivery.

## What The Merchant Sees

From start to finish, the merchant journey is:
1. Sign in or register on the dashboard.
2. Watch new orders arrive in Pending Approval.
3. Review the draft order details.
4. Set the price and approve the order.
5. Trigger the payment link generation.
6. Watch payment status update live.
7. Assign a rider.
8. Mark the order delivered.

## Current Product Shape

This prototype is split into two clear surfaces:
- Customer surface: `frontend-chat-sandbox` for WhatsApp-style ordering only.
- Merchant surface: `frontend-dashboard` for login/register, order review, approvals, and delivery management.

That separation is deliberate for now. If the product later grows into a multi-role platform, the auth flow can be expanded into a shared client/merchant account system without reworking the core order pipeline.

## Key Services

- `frontend-chat-sandbox`: customer chat experience
- `frontend-dashboard`: merchant order management
- `ai-engine`: message and voice parsing
- `backend-core`: order persistence and payment-link creation
- `backend-realtime`: webhook handling and live order updates
- `database`: shared schema and seed data

## Demo Order Flow In One Sentence
A customer places an order in chat, the AI turns it into a draft, the merchant approves it and sends payment, the webhook confirms payment, and delivery updates stream live to both screens.
