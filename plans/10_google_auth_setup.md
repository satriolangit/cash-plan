# Google OAuth Setup — Family Wallet

**Version:** 1.0
**Date:** 26 May 2026

---

# 1. Overview

Family Wallet uses Google as the sole identity provider (SSO). All authentication is handled via Google OAuth 2.0 through Auth.js. No password-based registration or login exists.

---

# 2. Create Google OAuth Credentials

## 2.1 Open Google Cloud Console

https://console.cloud.google.com/apis/credentials

Sign in with your Google account and create or select a project.

---

## 2.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type → click **Create**
3. Fill in:

| Field | Value |
|-------|-------|
| App name | `Family Wallet` |
| User support email | Your email address |
| Developer contact email | Your email address |

4. On **Scopes** step, click **Add or Remove Scopes**:
   - `email`
   - `profile`
   - `openid`

5. On **Test users** step, add your email as a test user
6. Review and click **Back to Dashboard**

---

## 2.3 Create OAuth 2.0 Client ID

1. Navigate to **Credentials** → click **+ Create Credentials** → **OAuth client ID**
2. Configure:

| Field | Value |
|-------|-------|
| Application type | **Web application** |
| Name | `Family Wallet Dev` (or any name) |

3. Add **Authorized redirect URIs**:

```
http://localhost:3000/api/auth/callback/google
```

4. Add **Authorized JavaScript origins**:

```
http://localhost:3000
```

5. Click **Create**

---

## 2.4 Copy Credentials

After creation, you'll see:

```
Client ID:     xxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxx
```

Copy both values. You **cannot** view the Client Secret again after closing the dialog.

---

# 3. Environment Variables

## 3.1 Development (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"

# Auth.js
AUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 3.2 Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

Or use:

```bash
npx auth secret
```

---

# 4. Production Setup

For production deployment on Vercel:

## 4.1 Google Cloud Console

Add your production domain as an authorized redirect URI:

```
https://your-domain.vercel.app/api/auth/callback/google
```

Add as JavaScript origin:

```
https://your-domain.vercel.app
```

## 4.2 Vercel Environment Variables

Add in Vercel dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your production Client ID |
| `GOOGLE_CLIENT_SECRET` | Your production Client Secret |
| `AUTH_SECRET` | Random secret string |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |

---

# 5. Publish OAuth App (Optional)

For production use without test user restrictions:

1. Go to **OAuth consent screen**
2. Click **PUBLISH APP**

Without publishing, only registered test users can sign in.

---

# 6. Auth Architecture

```
Browser
  ↓ Click "Sign in with Google"
Google OAuth Consent Screen
  ↓ User approves
Google Callback → /api/auth/callback/google
  ↓ Auth.js creates session
Redirect to /dashboard
```

### Route Summary

| Route | Purpose |
|-------|---------|
| `/signin` | SSO sign-in page (Google button) |
| `/error` | Auth error page |
| `/api/auth/signin/google` | Initiate Google OAuth |
| `/api/auth/callback/google` | Handle Google callback |
| `/api/auth/session` | Get current session |
| `/api/auth/signout` | Logout |

### Protected Routes

All routes under `/dashboard`, `/transactions`, `/budgets`, `/reports`, `/categories`, `/household`, `/profile` require authentication. Unauthenticated users are redirected to `/signin`.

---

# 7. Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing required parameter: client_id` | `GOOGLE_CLIENT_ID` is empty in `.env` | Fill in credentials |
| `redirect_uri_mismatch` | Callback URL not registered | Add `http://localhost:3000/api/auth/callback/google` to authorized URIs |
| `access_denied` | User not in test users list | Add email to OAuth consent screen test users, or publish the app |
| Google popup closes immediately | Popup blocked by browser | Allow popups for `localhost:3000` |

---

# 8. Security Notes

- Never commit `.env` to git (it's already in `.gitignore`)
- Keep `.env.example` as a template
- Rotate `AUTH_SECRET` if compromised
- Use separate OAuth credentials for development vs production
