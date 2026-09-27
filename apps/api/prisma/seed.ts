import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma/client.js';

config({ quiet: true });

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to seed a production database: the seed deletes all data first.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DOCTORS = [
  { name: 'Dr. Amara Okafor', specialty: 'General Practice' },
  { name: 'Dr. Ben Hartley', specialty: 'Cardiology' },
  { name: 'Dr. Chloe Nguyen', specialty: 'Dermatology' },
  { name: 'Dr. Dev Patel', specialty: 'Pediatrics' },
];

const DAYS_OF_SLOTS = 7;
const FIRST_HOUR = 9;
const LAST_HOUR = 12; // slots end by 12:00
const SLOT_MINUTES = 30;

// 30-minute slots from 09:00 to 12:00 (UTC) for the next 7 days, starting tomorrow.
function buildSlotTimes(): { startsAt: Date; endsAt: Date }[] {
  const slots = [];
  const today = new Date();

  for (let day = 1; day <= DAYS_OF_SLOTS; day++) {
    for (let minutes = FIRST_HOUR * 60; minutes < LAST_HOUR * 60; minutes += SLOT_MINUTES) {
      const startsAt = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + day),
      );
      startsAt.setUTCMinutes(minutes);
      const endsAt = new Date(startsAt.getTime() + SLOT_MINUTES * 60 * 1000);
      slots.push({ startsAt, endsAt });
    }
  }

  return slots;
}

async function main() {
  // Start from a clean slate. Children first, because of foreign keys.
  await prisma.appointment.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash('Admin123!', 10);
  const patientHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.create({
    data: {
      email: 'admin@clinicq.test',
      name: 'Clinic Admin',
      role: 'ADMIN',
      passwordHash: adminHash,
    },
  });
  const alice = await prisma.user.create({
    data: { email: 'alice@clinicq.test', name: 'Alice Morgan', passwordHash: patientHash },
  });
  const bob = await prisma.user.create({
    data: { email: 'bob@clinicq.test', name: 'Bob Lee', passwordHash: patientHash },
  });

  const slotTimes = buildSlotTimes();

  for (const doctor of DOCTORS) {
    await prisma.doctor.create({
      data: { ...doctor, slots: { create: slotTimes } },
    });
  }

  // A few appointments so "My appointments" and the admin view aren't empty.
  const [firstGpSlot, secondGpSlot] = await prisma.timeSlot.findMany({
    where: { doctor: { specialty: 'General Practice' } },
    orderBy: { startsAt: 'asc' },
    take: 2,
  });
  const cardiologySlot = await prisma.timeSlot.findFirstOrThrow({
    where: { doctor: { specialty: 'Cardiology' } },
    orderBy: { startsAt: 'asc' },
  });

  await prisma.appointment.createMany({
    data: [
      { patientId: alice.id, slotId: firstGpSlot.id, status: 'BOOKED' },
      { patientId: bob.id, slotId: cardiologySlot.id, status: 'BOOKED' },
      { patientId: bob.id, slotId: secondGpSlot.id, status: 'CANCELLED', cancelledAt: new Date() },
    ],
  });

  console.log(
    `Seeded ${DOCTORS.length} doctors, ${DOCTORS.length * slotTimes.length} slots, 3 users and 3 appointments.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
