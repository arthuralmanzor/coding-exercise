**# Payment Processing System Design for Per-User Monthly Subscriptions**

## **1. High-Level Payment Flow**

1. \*\*PCI-compliances

   - To make sure we follow global security standard designed to protect cardholder data, sensitive data will not be
     transmitted or saved anywhere other than the chosen payment provider
   - The front-end should use an sdk to directly communicate with the payment provider
   - Our server-side should listen to webhooks/events from the payment provider
   - For cards we will only save at the last 4 digit, brand, expiration date in our database

1. **User Sign-Up & Subscription Selection:**

   - Users create an account and choose a subscription plan.
   - A corresponding user payment account will also be created at the chosen payment provider
   - Users manage their payment methods(set default, delete, etc.), payment data should be sent directly to the payment
     provider and should not go through our server

1. **Payment Processing:**

   - The system securely forwards payment details to the payment provider.
   - If successful, a subscription entry is created in the system.
   - If failed, the user is prompted to update their payment information.

1. **Subscription Management:**

   - The system listens for webhook events from the payment provider.
   - Subscription status updates based on payment success, failure, or cancellation.

1. **Access Control:**
   - Users with an active subscription gain access to premium features.
   - Lapsed subscriptions result in restricted access.

---

## **2. Payment Provider Selection**

### **Criteria for Selection:**

- **Ease of Integration:** Must have a well-documented API.
- **Security & Compliance:** PCI-DSS compliance and fraud protection.
- **Pricing:** Competitive transaction fees.
- **Webhook Support:** Real-time event notifications for subscription updates.
- **Popular Options:**
  - **Stripe**
  - Authorize.net
  - PayPal

### Recommendation

**Stripe** is recommended due to ease of integration due to excellent documentation and admin panel with a huge
community. Stripe has full support for our use-cases including subscription.

However in case of restrictions such as
[prohibited business or countries](https://support.stripe.com/questions/prohibited-and-restricted-businesses-list-faqs),
might second recommendation would be **authorize.net**, we might need more development efforts but this payment method
does support all our use-cases

---

## **3. Subscription Management Strategy**

### **Data Model:**

- `users` (user details, role, and active status)
- `subscriptions` (user_id, plan_id, status, start_date, end_date, payment_provider)
- `payments` (subscription_id, transaction_id, amount, status, payment_date)

### **Lifecycle Handling:**

- **Payment Success:** Subscription is activated/renewed.
- **Payment Failure:** User is notified and given a grace period.
- **Cancellation:** Subscription is marked as canceled, access is revoked at the end of the billing cycle.
- **Refunds & Chargebacks:** Handled based on provider policies.

---

## **4. Access Control Based on Payment Status**

- **Middleware Enforcement:**
  - Check subscription status before granting access to premium features.
- **Grace Period:**
  - Allow limited access after payment failure before revocation.
- **Admin Dashboard:**
  - View and manage user subscriptions manually if needed.
- **Webhook Handling:**
  - Automatically update user access based on payment provider events.
