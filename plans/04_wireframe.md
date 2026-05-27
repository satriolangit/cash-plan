# Family Wallet — Updated Wireframe (Google Auth + Invite Link MVP)

Wireframe ini sudah direvisi berdasarkan architecture terbaru:

- Full Next.js
- [Auth.js](https://authjs.dev?utm_source=chatgpt.com) + Google OAuth
- Invite Link onboarding
- Mobile-first UX
- Minimal friction
- No register form
- No password flow
- Optimized for Vercel + Neon MVP

---

# 1. LANDING PAGE

## Route

```txt id="txqqz5"
/landing
```

---

# Mobile Wireframe

```txt id="k8f8bx"
┌──────────────────────┐
│      LOGO            │
│                      │
│ Family Wallet        │
│                      │
│ Kelola keuangan      │
│ keluarga lebih mudah │
│                      │
│ [ Continue Google ]  │
│                      │
│ 🔒 Secure by Google  │
│                      │
├──────────────────────┤
│ App Preview          │
│                      │
├──────────────────────┤
│ ✓ Budget Tracking    │
│ ✓ Shared Household   │
│ ✓ Monthly Reports    │
├──────────────────────┤
│ Footer               │
└──────────────────────┘
```

---

# Desktop Wireframe

```txt id="yy9vr5"
┌──────────────────────────────────────────────┐
│ LOGO                         Sign In         │
├──────────────────────────────────────────────┤
│                                              │
│  Headline              App Dashboard Preview │
│                                              │
│  Simple family finance                      │
│  management                                  │
│                                              │
│  [ Continue Google ]                         │
│                                              │
├──────────────────────────────────────────────┤
│ Features Grid                                │
├──────────────────────────────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

---

# 2. GOOGLE SIGN IN FLOW

## Route

```txt id="jlwm1t"
/auth/signin
```

---

# Wireframe

```txt id="jlwm3m"
┌──────────────────────┐
│                      │
│ Family Wallet        │
│                      │
│ Continue securely    │
│ with your Google     │
│ account              │
│                      │
│ [ Continue Google ]  │
│                      │
│ Secure authentication│
│ powered by Google    │
│                      │
└──────────────────────┘
```

---

# 3. INVITE LINK PAGE

## Route

```txt id="wjlwm3"
/invite/[token]
```

---

# Mobile Wireframe

```txt id="4q7s4z"
┌──────────────────────┐
│ Family Invitation    │
│                      │
│ 👨‍👩‍👧 Budi Family     │
│                      │
│ 4 members active     │
│                      │
│ Invite expires in    │
│ 5 days               │
│                      │
│ [ Continue Google ]  │
│                      │
│ Join household       │
│ securely             │
└──────────────────────┘
```

---

# Invalid Invite

```txt id="y2uy8x"
┌──────────────────────┐
│ Invalid Invitation   │
│                      │
│ This invite link     │
│ has expired          │
│                      │
│ Please contact       │
│ household owner      │
│                      │
│ [ Back ]             │
└──────────────────────┘
```

---

# 4. MOBILE APP LAYOUT

---

# Main App Shell

```txt id="xjlwm2"
┌──────────────────────┐
│ Header               │
├──────────────────────┤
│                      │
│ Main Content         │
│                      │
│                      │
│                      │
│                      │
├──────────────────────┤
│ Dashboard Transactions│
│                      │
│      + FAB           │
│                      │
│ Reports    Profile   │
└──────────────────────┘
```

---

# Floating Action Button

```txt id="jlwmk4"
(+)
```

Purpose:

```txt id="0c40tx"
Quick Add Transaction
```

---

# 5. DASHBOARD PAGE

## Route

```txt id="jlwm0a"
/dashboard
```

---

# Mobile Wireframe

```txt id="7jlwm4"
┌──────────────────────┐
│ Hi, Budi 👋          │
│ Mei 2026             │
├──────────────────────┤
│ Net Balance          │
│ Rp 4.500.000         │
│ ↑ +12% bulan ini     │
├──────────────────────┤
│ Income   Expense     │
│ 5.5 jt   1 jt        │
├──────────────────────┤
│ ⚠ Budget Alert       │
│ Transport 85%        │
├──────────────────────┤
│ [ + Add Transaction ]│
├──────────────────────┤
│ Recent Transactions  │
│                      │
│ 🍔 Lunch  -50k       │
│ ⛽ Fuel   -100k      │
│ 💼 Salary +5jt       │
│                      │
│ Lihat Semua →        │
├──────────────────────┤
│ Budget Progress      │
│ ███████░░ 70%        │
├──────────────────────┤
│ Expense Chart        │
└──────────────────────┘
```

---

# Desktop Wireframe

```txt id="jlwm3y"
┌──────────┬──────────────────────────────┐
│ Sidebar  │ Topbar                      │
├──────────┼──────────────────────────────┤
│          │ Balance | Income | Expense  │
│ Menu     ├──────────────────────────────┤
│          │ Budget Alert Banner         │
│          ├──────────────┬──────────────┤
│          │ Recent Tx    │ Expense Chart│
│          │              │              │
│          ├──────────────┼──────────────┤
│          │ Budget Prog  │ Trend Chart  │
└──────────┴──────────────┴──────────────┘
```

---

# 6. TRANSACTION LIST PAGE

## Route

```txt id="8jlwm0"
/transactions
```

---

# Mobile Wireframe

```txt id="jlwmm9"
┌──────────────────────┐
│ Transactions         │
├──────────────────────┤
│ [ Mei ▼ ]            │
│ [ Expense ▼ ]        │
│ [ All Categories ▼ ] │
├──────────────────────┤
│ 🍔 Food              │
│ Lunch                │
│ 26 Mei               │
│ - Rp 50.000          │
├──────────────────────┤
│ ⛽ Transport         │
│ Fuel                 │
│ 25 Mei               │
│ - Rp 100.000         │
├──────────────────────┤
│ 💼 Salary            │
│ Monthly salary       │
│ + Rp 5.000.000       │
├──────────────────────┤
│ Load More            │
└──────────────────────┘
```

---

# Recommended UX

## Swipe Gesture

```txt id="8wjlwm"
Swipe Left → Edit/Delete
```

---

# 7. ADD TRANSACTION PAGE

## Route

```txt id="jlwmr6"
/transactions/new
```

---

# Mobile Bottom Sheet Wireframe

```txt id="jlwm8e"
┌──────────────────────┐
│ Add Transaction      │
├──────────────────────┤
│ Type                 │
│ (•) Expense          │
│ ( ) Income           │
├──────────────────────┤
│ Amount               │
│ [ Rp________ ]       │
├──────────────────────┤
│ Category             │
│ [ Food ▼ ]           │
├──────────────────────┤
│ Date                 │
│ [ 26/05/2026 ]       │
├──────────────────────┤
│ Description          │
│ [______________]     │
├──────────────────────┤
│ [ Save Transaction ] │
└──────────────────────┘
```

---

# UX Optimization

## Smart Defaults

```txt id="wjlwm9"
Today Date
Last Category
Numeric Keyboard
```

---

# 8. REPORT PAGE

## Route

```txt id="jlwm41"
/reports
```

---

# Mobile Wireframe

```txt id="8jlwmf"
┌──────────────────────┐
│ Reports              │
├──────────────────────┤
│ Overview Categories  │
│ Monthly              │
├──────────────────────┤
│ Expense Breakdown    │
│                      │
│ Donut Chart          │
├──────────────────────┤
│ Monthly Trend        │
│                      │
│ Bar Chart            │
├──────────────────────┤
│ [ Export CSV ]       │
└──────────────────────┘
```

---

# 9. BUDGET PAGE

## Route

```txt id="8jlwmc"
/budgets
```

---

# Mobile Wireframe

```txt id="jlwm5v"
┌──────────────────────┐
│ Monthly Budgets      │
├──────────────────────┤
│ 🍔 Food              │
│ Rp 2.000.000         │
│ ███████░░ 70%        │
├──────────────────────┤
│ ⛽ Transport         │
│ Rp 1.000.000         │
│ ██████████ 100%      │
├──────────────────────┤
│ [ + Add Budget ]     │
└──────────────────────┘
```

---

# Empty State

```txt id="jlwm0m"
┌──────────────────────┐
│ No Budget Yet        │
│                      │
│ Create budget to     │
│ monitor spending     │
│                      │
│ [ Add Budget ]       │
└──────────────────────┘
```

---

# 10. CATEGORY PAGE

## Route

```txt id="jlwmc9"
/categories
```

---

# Wireframe

```txt id="jlwmg0"
┌──────────────────────┐
│ Categories           │
├──────────────────────┤
│ Income               │
│ 💼 Salary            │
│ 📈 Investment        │
├──────────────────────┤
│ Expense              │
│ 🍔 Food              │
│ ⛽ Transport         │
│ 🛒 Shopping          │
├──────────────────────┤
│ [ + Add Category ]   │
└──────────────────────┘
```

---

# 11. HOUSEHOLD PAGE

## Route

```txt id="0jlwmw"
/household
```

---

# Wireframe

```txt id="jlwmq1"
┌──────────────────────┐
│ Household            │
├──────────────────────┤
│ 👨‍👩‍👧 Budi Family     │
│ 4 Members            │
├──────────────────────┤
│ Invite Member        │
│                      │
│ [ Copy Invite Link ] │
│ [ Share WhatsApp ]   │
├──────────────────────┤
│ Manage Members →     │
│ Settings →           │
└──────────────────────┘
```

---

# 12. MEMBERS PAGE

## Route

```txt id="8jlwmh"
/household/members
```

---

# Wireframe

```txt id="4jlwmn"
┌──────────────────────┐
│ Members              │
├──────────────────────┤
│ 👤 Budi              │
│ Owner                │
├──────────────────────┤
│ 👤 Ani               │
│ Member               │
│ [ Remove ]           │
├──────────────────────┤
│ 👤 Dimas             │
│ Member               │
│ [ Remove ]           │
└──────────────────────┘
```

---

# 13. PROFILE PAGE

## Route

```txt id="jjlwm0"
/profile
```

---

# Wireframe

```txt id="jlwmv7"
┌──────────────────────┐
│ Profile              │
├──────────────────────┤
│ Avatar               │
│                      │
│ Budi Santoso         │
│ budi@gmail.com       │
├──────────────────────┤
│ Household            │
│ Budi Family          │
├──────────────────────┤
│ [ Logout ]           │
└──────────────────────┘
```

---

# 14. EMPTY STATES

---

# No Transactions

```txt id="wjlwm4"
┌──────────────────────┐
│ No Transactions Yet  │
│                      │
│ Start tracking your  │
│ family finance       │
│                      │
│ [ Add Transaction ]  │
└──────────────────────┘
```

---

# 15. ERROR STATES

---

# Unauthorized

```txt id="4jlwm1"
┌──────────────────────┐
│ 403                  │
│                      │
│ You don't have       │
│ access to this page  │
│                      │
│ [ Back Dashboard ]   │
└──────────────────────┘
```

---

# Network Error

```txt id="6jlwm3"
┌──────────────────────┐
│ Connection Error     │
│                      │
│ Please try again     │
│                      │
│ [ Retry ]            │
└──────────────────────┘
```

---

# 16. DESIGN SYSTEM RECOMMENDATION

# Primary Color

```txt id="8jlwmq"
#26A8E0
```

---

# Background

```txt id="4jlwm2"
#F8FAFC
```

---

# Success

```txt id="3jlwmv"
#16A34A
```

---

# Warning

```txt id="yjlwm0"
#F59E0B
```

---

# Danger

```txt id="0jlwm5"
#DC2626
```

---

# 17. RECOMMENDED CORE COMPONENTS

```txt id="2jlwm6"
AppShell
BottomNavigation
Sidebar
Header
SummaryCard
TransactionCard
BudgetCard
ChartCard
FloatingActionButton
ModalSheet
AlertBanner
EmptyState
ConfirmationDialog
ToastNotification
```

---

# 18. FINAL UX PRIORITY

## Most Important

```txt id="4jlwmf"
Fast onboarding
Fast transaction input
Mobile usability
Financial visibility
Simple navigation
```

---

# VERY IMPORTANT MVP PRINCIPLE

Aplikasi harus terasa seperti:

```txt id="5jlwm8"
Simple family finance tracker
```

bukan:

```txt id="6jlwm9"
Complex accounting software
```
