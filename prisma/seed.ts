import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("staff123", 10);

  await prisma.user.createMany({
    data: [
      {
        fullName: "Owner User",
        nic: "901234567V",
        mobileNumber: "0710000000",
        email: "owner@test.com",
        username: "owner1",
        passwordHash: hash,
        role: UserRole.OWNER,
      },
      {
        fullName: "Staff User",
        nic: "911234567V",
        mobileNumber: "0711111111",
        email: "staff@test.com",
        username: "staff1",
        passwordHash: hash,
        role: UserRole.STAFF,
      },
    ],
    skipDuplicates: true,
  });

  const customer = await prisma.customer.upsert({
    where: { id: "cust-seed-1" },
    update: {},
    create: {
      id: "cust-seed-1",
      fullName: "Walk-in Customer",
      phone: "0771234567",
      email: null,
    },
  });

  const cat = await prisma.category.upsert({
    where: { name: "Beverages" },
    update: {},
    create: { name: "Beverages" },
  });

  await prisma.product.createMany({
    data: [
      { name: "Coke", price: 150, categoryId: cat.id, barcode: "COKE001" },
      { name: "Pepsi", price: 140, categoryId: cat.id, barcode: "PEPSI001" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete. Staff login: staff1 / staff123");
  console.log("✅ Test customer id:", customer.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
