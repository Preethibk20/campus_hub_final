# User Signup Flow Design

This document outlines the architecture and design for a secure user signup flow with Email OTP verification.

## 1. Complete User Signup Flow

### Phase 1: User Registration Initiation
1. **User Input:** The user navigates to the signup page and enters:
   - `Username`
   - `Email` (e.g., standard or Gmail)
   - `Password`
2. **System Validation:**
   - Validate email format (regex check).
   - Check password strength (e.g., min 8 chars, 1 uppercase, 1 special character).
   - Check if the email or username already exists in the database.
   - If validation fails, return appropriate error messages.
3. **OTP Generation & Processing:**
   - Generate a secure random 6-digit OTP.
   - Hash the OTP (e.g., SHA-256 or bcrypt) for secure storage.
   - Hash the user's password (e.g., bcrypt/argon2).
   - Store the OTP hash and user details temporarily in the `OTP Table` with an expiry time (typically 5-10 minutes) and initialize the `attempt_count` to 0.
4. **Email Dispatch:**
   - Send the OTP to the user's registered email using the configured SMTP server or Email API.

### Phase 2: OTP Verification
1. **User Input:** The user enters the 6-digit OTP received via email on the verification screen.
2. **System Verification:**
   - Fetch the active OTP record for the email.
   - Check if the record exists.
   - Check if `expires_at` is in the past. If expired, return "OTP expired".
   - Check `attempt_count`. If exceeded (e.g., max 3 attempts), block further attempts and require generating a new OTP.
   - Hash the provided OTP and compare it with the stored `otp_hash`.
3. **Successful Match:**
   - If the OTP is valid, proceed to **Account Creation**.
   - Create a persistent user record in the `Users Table` using the temporarily stored details. Save `password_hash` and set `is_verified = true`.
   - Delete or mark the OTP record as used.
   - (Optional) Automatically log the user in by generating a session or JWT.
4. **Failed Match:**
   - Increment `attempt_count`.
   - Return "Incorrect OTP" error.

### Phase 3: Resend Logic
1. Allow the user to request a new OTP after a cooldown period (e.g., 30-60 seconds).
2. On request:
   - Invalidate any previous unused OTP entries for the email.
   - Generate a new OTP.
   - Update `expires_at` and reset `attempt_count`.
   - Dispatch the new email.

---

## 2. Database Design

### Users Table (`users`)
Stores verified, active user accounts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / BIGINT | Primary Key | Unique user identifier |
| `username` | VARCHAR | Unique, Not Null | Chosen user handle |
| `email` | VARCHAR | Unique, Not Null | User's email address |
| `password_hash` | VARCHAR | Not Null | Bcrypt/Argon2 hashed password |
| `is_verified` | BOOLEAN | Default `false` | True when email is verified |
| `created_at` | TIMESTAMP | Default `NOW()` | Account creation time |

### OTP Table (`otps`)
Stores transient information during the verification phase.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / BIGINT | Primary Key | Unique record identifier |
| `email` | VARCHAR | Indexed, Not Null | Target email address |
| `otp_hash` | VARCHAR | Not Null | Hashed OTP for verification |
| `expires_at` | TIMESTAMP | Not Null | Expiration timestamp (e.g. +5min) |
| `attempt_count` | INT | Default `0` | Number of failed verification attempts |

*Note: Depending on implementation, you might optionally store the plain Registration Data (username, password_hash) temporarily in this table or a Redis cache until verification completes.*

---

## 3. Email Sending Strategy

For zero-cost implementation, **Option 1: Gmail SMTP** is highly recommended if you have low volume initially.

**Configuration requirements (using an `.env` file):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=<YOUR_APP_PASSWORD>
```

Alternatively, API-based options (SendGrid or Brevo) offer better deliverability and scaling:
```env
SENDGRID_API_KEY=<YOUR_API_KEY>
```

---

## 4. Security Best Practices Summary

- **Password Hashing:** Always use `bcrypt` or `argon2`. Never store plain text.
- **OTP Hashing:** Hash OTPs in the database using at least SHA-256 to prevent compromise in case of DB read access.
- **Rate Limiting:** Implement strict rate limiting on the `/request-otp` endpoints to prevent email-bombing (e.g., max 3 requests per IP per minute).
- **Brute Force Prevention:** Limit OTP verification attempts to a maximum of 3. After that, invalidate the OTP.
- **Short TTL:** OTPs should expire within 5-10 minutes.
- **HTTPS Only:** Ensure the entire flow operates over a secure TLS/HTTPS connection.
