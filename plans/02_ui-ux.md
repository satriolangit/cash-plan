# UI/UX Direction Recommendation — Family Wallet

> “ultra simple collaborative finance app”

Mirip kombinasi:

- banking app modern,
- budgeting app ringan,
- dan family dashboard.

---

# Design Principles

## 1. One-Handed Mobile UX

Mayoritas user akan:

- buka sambil berdiri,
- sambil belanja,
- sambil naik motor/mobil,
- sambil ngobrol.

Jadi:

- tombol utama harus reachable,
- bottom navigation wajib,
- input transaksi harus maksimal 2–3 tap.

---

# 2. Prioritize Fast Input

Goal utama user:

> “catat pengeluaran secepat mungkin”

Bukan:

- lihat chart,
- setting,
- analytics.

Jadi UX harus fokus ke:

- quick add,
- smart defaults,
- recent categories,
- recent wallet.

---

# 3. Reduce Financial Anxiety

Aplikasi finance sering terasa:

- berat,
- intimidating,
- terlalu “accounting”.

Gunakan:

- whitespace besar,
- rounded card,
- soft colors,
- positive tone.

Jangan terlalu spreadsheet-like.

---

# 4. Dashboard Must Feel Calm

Jangan terlalu banyak:

- angka,
- chart,
- warna merah.

Karena finance app bisa bikin stress.

Dashboard harus terasa:

- clean,
- modern,
- reassuring.

---

# Recommended Design Style

## Direction

Gabungan style:

- Monarch Money
- Copilot Money
- Linear (untuk cleanliness)
- modern fintech Indonesia.

---

# Recommended Theme

## Primary Color

Aku tidak menyarankan biru fintech generic.

Karena:

- terlalu banking,
- terlalu corporate.

Untuk family finance:
lebih cocok warna:

- calming,
- trustworthy,
- modern.

---

# Recommended Palette

## Option 1 — Best Overall (Recommended)

### Primary

```css
#14B8A6
```

Teal modern.

Kesan:

- financial,
- healthy,
- calm,
- modern.

---

### Secondary

```css
#0F172A
```

Dark slate.

---

### Accent

```css
#F59E0B
```

Amber.

Untuk:

- warning budget,
- highlights.

---

### Background

```css
#F8FAFC
```

---

### Card

```css
#FFFFFF
```

---

### Success

```css
#22C55E
```

---

### Danger

```css
#EF4444
```

---

# Kenapa Teal?

Karena:

- lebih friendly daripada blue,
- lebih modern,
- cocok untuk finance + family,
- bagus di light mode,
- cocok untuk chart.

---

# Typography Recommendation

## Font

### Best choice:

```txt
Inter
```

Karena:

- modern,
- readable kecil,
- bagus untuk angka,
- clean.

Alternative:

- Plus Jakarta Sans
- DM Sans

---

# UI Layout Recommendation

# Mobile First Layout

## Bottom Navigation

Gunakan 5 menu:

| Menu         | Icon        |
| ------------ | ----------- |
| Dashboard    | Home        |
| Transactions | Receipt     |
| Add          | Plus Circle |
| Budget       | Wallet      |
| Profile      | User        |

---

# Floating Add Button

Tombol paling penting.

Position:

- bottom center,
- besar,
- standout.

Action:

- quick add transaction.

---

# Dashboard Layout

## Hero Balance Card

Top section:

```txt
Total Balance
Rp 12.500.000

+12% this month
```

Dengan:

- gradient halus,
- rounded 24px,
- sedikit glow/shadow.

---

# Wallet Cards

Horizontal scroll.

Contoh:

```txt
BCA
Rp 5.200.000

Cash
Rp 750.000
```

Card compact seperti mobile banking.

---

# Quick Actions

Grid:

- Add Expense
- Add Income
- Transfer
- Budget

---

# Budget Section

Gunakan:

- progress bar besar,
- warna soft,
- jangan terlalu merah agresif.

Contoh:

```txt
Food
Rp 2.4jt / Rp 3jt
████████░░ 80%
```

---

# Transaction List UX

## Sangat penting

Jangan seperti tabel accounting.

Gunakan card/list modern.

---

# Recommended Transaction Item

```txt
🍜 Makan & Minum
Bakso Pak Kumis

Today • Cash

- Rp 35.000
```

---

# UX Improvements Recommendation

# 1. Quick Add Sheet

Saat klik tambah:
muncul bottom sheet.

Bukan pindah page penuh.

Karena:
lebih cepat.

---

# 2. Smart Defaults

Auto:

- tanggal hari ini,
- wallet terakhir,
- kategori terakhir.

Ini massively improves UX.

---

# 3. Recent Categories

Top categories muncul otomatis.

Contoh:

- Food
- Transport
- Bills

1 tap input.

---

# 4. Swipe Actions

Transaction list:

- swipe left → delete
- swipe right → edit

Mobile feels better.

---

# 5. Empty State Important

Saat kosong:

- illustration ringan,
- CTA jelas.

Contoh:

```txt
Belum ada transaksi hari ini
Mulai catat pengeluaran pertama
```

---

# Responsive Recommendation

## Breakpoints

| Device  | Width    |
| ------- | -------- |
| Mobile  | 360–767  |
| Tablet  | 768–1023 |
| Desktop | 1024+    |

---

# Desktop UX

Desktop jangan dibuat seperti enterprise dashboard.

Tetap:

- centered layout,
- max width 1400px,
- card based.

---

# Recommended Frontend Stack

Karena kamu sudah biasa React ecosystem:

## Perfect Stack

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion
- Zustand
- React Query

---

# Recommended UI Components

## Use shadcn/ui for:

- dialog
- sheet
- dropdown
- form
- tabs

---

# Animation Recommendation

Gunakan subtle animation saja.

Contoh:

- card hover,
- smooth number transition,
- slide bottom sheet.

Jangan terlalu banyak motion.

Finance app harus terasa stabil.

---

# Recommended Design System Rules

## Radius

```css
rounded-2xl
```

---

## Shadow

Soft shadow only.

---

## Spacing

Gunakan spacing lega.

Minimal:

```css
p-4
gap-4
```

---

# Important UX Decision

## Jangan buat terlalu banyak menu

Ini mistake paling umum.

Untuk MVP:
cukup:

- Dashboard
- Transactions
- Budget
- Profile

Wallet bisa nested.

---

# Recommended Overall UX Tone

Target feeling:

> “simple, calm, collaborative family finance”

Bukan:

- accounting software,
- ERP,
- spreadsheet app.

---

# Final Recommendation

Kalau aku jadi product designer project ini:

## Fokus terbesar:

1. ultra fast transaction input
2. clean dashboard
3. mobile-first UX
4. calming finance experience
5. collaborative household feel

Karena itu yang membedakan aplikasi ini dari expense tracker biasa.
