# Migrations / Post-merge steps

Because Parts 4–6 add **payment method** and **sale type** to Orders and we need proper totals, I added two optional fields to your Prisma schema:

```prisma
model Order {
  // ...
  status        String   @default("PENDING")
  paymentMethod String?
  saleType      String?
  // ...
}
```

## Apply the schema change

On your machine:

```bash
pnpm prisma:generate
pnpm prisma:migrate -n add-order-payment-sale
# or, during development only:
# pnpm prisma db push
```

If you get errors related to **Customer.phone** unique constraint, you can ignore — the code does not require it. (We do a find+update instead of upsert by phone.)

## Seed refresh (optional)

If your DB is new:

```bash
pnpm prisma:reset
pnpm seed
```

This leaves a **Walk-in Customer** as a default (id `cust-seed-1`).

## Dev

```bash
pnpm dev
```

- Owner: `owner1 / staff123` (from seed)
- Staff: `staff1 / staff123`
