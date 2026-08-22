# DASH MOBILE SERVICES Automated Email Setup

## Current test configuration

- Sending address: `davidroyemployment@gmail.com`
- Test destination: `djroy20.2004@gmail.com`
- Test subject: `DASH MOBILE SERVICES — Automated Email Test`

## Recommended production architecture

The GitHub Pages site is static, so it must not contain Gmail credentials or a Gmail access token. The Admin Portal should call a secure backend endpoint that performs the email send.

For the current Gmail-based setup, use Google OAuth 2.0 / Gmail API rather than placing the normal Gmail password in the website. Google recommends Sign in with Google where available; app passwords are a fallback for apps that do not support the preferred sign-in flow and require 2-Step Verification. See Google account security documentation before configuring authentication.

### Required secure components

1. GitHub Pages: DASH website and Admin Portal interface only.
2. Secure backend/serverless endpoint: receives an authenticated Admin Portal request and sends the email.
3. Google OAuth 2.0: authorizes the backend to send mail from the DASH Gmail account.
4. Secret storage/environment variables: stores OAuth credentials and tokens outside the GitHub repository.
5. Admin authentication/authorization: only authorized DASH administrators can trigger test or automated emails.

## Test email

When the secure connection is configured, the Admin Portal's **Send Test Automated Email** action should send:

**From:** `davidroyemployment@gmail.com`

**To:** `djroy20.2004@gmail.com`

**Subject:** `DASH MOBILE SERVICES — Automated Email Test`

**Body:**

This is a test email from DASH MOBILE SERVICES to ensure the automated email system is working correctly leading up to launch day.

## Important security rules

- Never commit Gmail passwords, OAuth client secrets, refresh tokens, API keys, or service-role keys to GitHub.
- Never put a Gmail access token in client-side JavaScript.
- The public website must never be able to trigger arbitrary email sends without server-side authorization.
- The Admin Portal should record test status without storing credentials.
- Use least-privilege access wherever the selected email/backend provider supports it.

## Current status

The Admin Portal interface and test-email configuration are prepared. The live Gmail sending connection is **not configured yet**. No email is claimed to have been sent until the secure backend and Google authorization are completed and tested.