# Auth & Onboarding — Design Brief

**Date:** 2026-10-07
**Status:** Draft — awaiting review
**Next step:** Wireframes (UI/UX skill), then implementation plan

## 1. Goal

Let a new user go from "no account" to their dashboard with one wallet set up, in under a minute and with two forms. Let a returning user log in in one form.

## 2. Context & Constraints

- **Stack:** Next.js 16 (App Router), Tailwind 4, Redux Toolkit, React Query, date-fns.
- **Backend:** A separate API with a Prisma database handles auth and data. This frontend calls it and does not own auth logic.
- **Users:** International. The currency picker must handle every ISO 4217 currency, and all copy must be translatable (no strings baked into images, layouts that tolerate longer text).
- **Device:** Mobile-first. On desktop, the same single-column layout is centered (max width ~420px) on a neutral background.

## 3. Scope

**In scope**
- Login
- Register
- Forgot password (request link, then reset password)
- Onboarding: create first wallet
- Redirect rules between these screens and the dashboard

**Out of scope (later)**
- Social login (Google etc.)
- Email verification
- The dashboard's content (this brief only defines arriving there)
- Adding further wallets (done from the dashboard)
- Language switcher UI (copy is translatable, but only English ships first)

## 4. User Flows

```
New user:        /auth/register ──► /onboarding/wallet ──► /dashboard
Returning user:  /auth/login ─────────────────────────────► /dashboard
Forgot password: /auth/login ──► /auth/forgot-password ──► (email) ──► /auth/reset-password ──► /auth/login
```

**Redirect rules**

| User state | Visits | Goes to |
|---|---|---|
| Logged out | `/onboarding/*`, `/dashboard` | `/auth/login` |
| Logged in, has no wallet | `/auth/*`, `/dashboard` | `/onboarding/wallet` |
| Logged in, has ≥1 wallet | `/auth/*`, `/onboarding/*` | `/dashboard` |

A user who registers and closes the tab before creating a wallet is sent back to onboarding on their next login.

## 5. Screens

All screens share the same layout: app logo at the top, a short heading and subheading, the form, then a secondary link at the bottom. Primary button is full width and at least 48px tall.

### 5.1 Login — `/auth/login`

- **Heading:** "Welcome back"
- **Fields:**
  - Email (`type=email`, `autocomplete=email`)
  - Password with show/hide toggle (`autocomplete=current-password`)
- **Link:** "Forgot password?" sits right-aligned under the password field
- **Primary:** "Log in"
- **Footer:** "New here? **Create an account**" goes to Register

### 5.2 Register — `/auth/register`

- **Heading:** "Create your account"
- **Subheading:** "Start tracking your money in under a minute."
- **Fields:**
  - Name (`autocomplete=name`), used to greet the user on the dashboard
  - Email (`type=email`, `autocomplete=email`)
  - Password with show/hide toggle (`autocomplete=new-password`), with a hint below: "At least 8 characters"
- **Primary:** "Create account"
- **Footer:** "Already have an account? **Log in**"
- **On success:** the user is logged in automatically and goes to `/onboarding/wallet`

### 5.3 Forgot Password — `/auth/forgot-password`

- **Heading:** "Reset your password"
- **Field:** Email
- **Primary:** "Send reset link"
- **After submit:** the form is replaced in place by a confirmation: "If an account exists for {email}, we've sent a reset link." Two actions follow: "Back to log in" and "Resend" (disabled for 60s).
- **Footer:** "Back to log in"

### 5.4 Reset Password — `/auth/reset-password?token=…`

- **Heading:** "Choose a new password"
- **Field:** New password with show/hide toggle and the 8-character hint
- **Primary:** "Update password"
- **On success:** goes to Login with a success banner: "Password updated. Log in with your new password."
- **Expired or invalid token:** shows "This link has expired" with a "Send a new link" button that goes to Forgot Password

### 5.5 Create Wallet — `/onboarding/wallet`

The approach is **a single screen with smart defaults**, so many users only need to check the values and tap the button.

- **Heading:** "Hi {name}, let's set up your first wallet"
- **Subheading:** "You can add more wallets later."
- **Fields, top to bottom:**
  1. **Type:** four tappable icon tiles in a 2×2 grid. Exactly one is selected, and `Cash` is the default.
     | Value | Label | Icon idea |
     |---|---|---|
     | `cash` | Cash | banknote |
     | `bank` | Bank account | bank building |
     | `credit_card` | Credit card | card |
     | `e_wallet` | E-wallet | phone |
  2. **Name:** a text field prefilled from the selected type ("Cash", "Bank account", …). It follows the type until the user edits it, then stops following.
  3. **Currency:** a searchable picker that opens as a bottom sheet on mobile. Each row shows the code, name and symbol ("USD — US Dollar — $"). The default comes from the browser locale's region, falling back to USD.
  4. **Starting balance:** a numeric field with the currency symbol as a prefix, defaulting to 0. It uses `inputmode=decimal`, allows up to 2 decimals, and is formatted with `Intl.NumberFormat` for the chosen currency.
- **Primary:** "Create wallet"
- **On success:** goes to `/dashboard`
- **No skip button.** Every user needs at least one wallet before using the dashboard.

## 6. Validation & Error Handling

**Field validation** runs when the user leaves a field and again on submit. Errors appear inline under the field in red with an icon, and focus moves to the first invalid field on submit.

| Field | Rule | Message |
|---|---|---|
| Name (register) | Required, 1–50 characters | "Please enter your name" |
| Email | Required, valid format | "Enter a valid email address" |
| Password (register/reset) | At least 8 characters | "Password must be at least 8 characters" |
| Wallet name | Required, 1–50 characters | "Give your wallet a name" |
| Currency | Required, a valid ISO 4217 code | "Choose a currency" |
| Starting balance | A number of 0 or more, up to 14 integer digits and 2 decimals (fits `Decimal(16,2)`) | "Enter a valid amount" |

**Server and network errors**

| Case | Behavior |
|---|---|
| Wrong email or password | Banner above the form: "Email or password is incorrect." The message never says which one, so it doesn't reveal whether an account exists. |
| Email already registered | Inline on the email field: "An account with this email already exists. **Log in?**" |
| Too many attempts | Banner: "Too many attempts. Try again in a few minutes." |
| Network or server error | Banner: "Something went wrong. Check your connection and try again." Form values are kept. |
| Forgot password | Always shows the same confirmation, whether or not the email exists |

**Loading:** while a request is in flight, the primary button shows a spinner, is disabled and keeps its width. Fields stay visible but are read-only.

## 7. Accessibility

- Every input has a visible `<label>`, not only a placeholder.
- Errors are linked to their inputs with `aria-describedby`, and banners use `role="alert"`.
- Touch targets are at least 44×44px. The show/hide toggle is a real `<button>` with `aria-label="Show password"` / `"Hide password"`.
- Wallet type tiles behave as a radio group (`role="radiogroup"`) and can be navigated with arrow keys.
- Text and controls meet WCAG AA color contrast.

## 8. Testing Focus

- Redirect rules from §4 for each of the three user states
- Validation rules from §6, including the balance boundaries (0, 2 decimals, 14 digits)
- The wallet name follows the selected type until the user edits it
- The currency default comes from the locale, falling back to USD
- Forgot password shows identical output for known and unknown emails

## 9. Open Questions

1. **Credit card balance:** a credit card usually holds debt. Should its starting balance be entered as "amount owed" and stored as a negative number, or should every type accept only positive balances for now? *Default if not decided: positive only, same as other types.*
2. **Session storage:** does the backend issue an httpOnly cookie or a token? This affects how the redirect rules are implemented (middleware vs. client check), but not the wireframes.
