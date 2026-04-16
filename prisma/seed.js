const {
  Prisma,
  PrismaClient,
  CertificationStatus,
  CertificationType,
  OrderStatus,
  RentalAvailability,
  RentalBookingStatus,
  UserRole,
  UserStatus,
} = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ quiet: true });

if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: '.env.example', quiet: true });
}

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Password@123';

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

async function resetDatabase() {
  await prisma.plantTracking.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rentalBooking.deleteMany();
  await prisma.sustainabilityCert.deleteMany();
  await prisma.produce.deleteMany();
  await prisma.rentalSpace.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function createUsersAndProfiles(passwordHash) {
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@greengrid.local',
      password: passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const customerNames = [
    'Ava Khan',
    'Noman Rahman',
    'Sophia Islam',
    'Rafiul Karim',
    'Maya Chowdhury',
    'Tanvir Hasan',
    'Nadia Ahmed',
    'Ibrahim Sayeed',
  ];

  const customers = [];
  for (let index = 0; index < customerNames.length; index += 1) {
    const customer = await prisma.user.create({
      data: {
        name: customerNames[index],
        email: `customer${index + 1}@greengrid.local`,
        password: passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });

    customers.push(customer);
  }

  const vendorSeeds = [
    { name: 'SkyLeaf Farms', location: 'Gulshan, Dhaka' },
    { name: 'Balcony Bloom Co.', location: 'Dhanmondi, Dhaka' },
    { name: 'Metro Microgreens', location: 'Banani, Dhaka' },
    { name: 'Urban Roots Collective', location: 'Mirpur, Dhaka' },
    { name: 'Rooftop Harvest Lab', location: 'Uttara, Dhaka' },
    { name: 'FreshGrid Hydro', location: 'Mohammadpur, Dhaka' },
    { name: 'City Sprout Farms', location: 'Badda, Dhaka' },
    { name: 'GreenBox Gardens', location: 'Farmgate, Dhaka' },
    { name: 'AgriNest Urban Farm', location: 'Tejgaon, Dhaka' },
    { name: 'SunPatch Produce Hub', location: 'Wari, Dhaka' },
  ];

  const vendorStatusMap = [
    CertificationStatus.APPROVED,
    CertificationStatus.APPROVED,
    CertificationStatus.APPROVED,
    CertificationStatus.APPROVED,
    CertificationStatus.APPROVED,
    CertificationStatus.APPROVED,
    CertificationStatus.PENDING,
    CertificationStatus.PENDING,
    CertificationStatus.REJECTED,
    CertificationStatus.REJECTED,
  ];

  const vendors = [];

  for (let index = 0; index < vendorSeeds.length; index += 1) {
    const vendorUser = await prisma.user.create({
      data: {
        name: vendorSeeds[index].name,
        email: `vendor${index + 1}@greengrid.local`,
        password: passwordHash,
        role: UserRole.VENDOR,
        status: UserStatus.ACTIVE,
      },
    });

    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: vendorUser.id,
        farmName: vendorSeeds[index].name,
        farmLocation: vendorSeeds[index].location,
        certificationStatus: vendorStatusMap[index],
      },
    });

    const certStatus = vendorStatusMap[index];
    const certType = index % 2 === 0 ? CertificationType.SUSTAINABILITY : CertificationType.ORGANIC;

    await prisma.sustainabilityCert.create({
      data: {
        vendorId: vendorUser.id,
        certificationType: certType,
        certifyingAgency: certType === CertificationType.SUSTAINABILITY ? 'Urban Green Council' : 'Organic Trust Alliance',
        certificationNumber: `GG-${index + 1}-2026`,
        certificationDate: daysAgo(120 + index * 7),
        documentUrl: `https://example.org/certificates/vendor-${index + 1}.pdf`,
        status: certStatus,
        reviewNotes:
          certStatus === CertificationStatus.APPROVED
            ? 'All sustainability criteria satisfied.'
            : certStatus === CertificationStatus.REJECTED
              ? 'Resubmit with complete traceability records.'
              : null,
        reviewedAt: certStatus === CertificationStatus.PENDING ? null : daysAgo(40 - index),
        reviewedById: certStatus === CertificationStatus.PENDING ? null : admin.id,
      },
    });

    vendors.push({
      user: vendorUser,
      profile: vendorProfile,
      certificationStatus: certStatus,
    });
  }

  return { admin, customers, vendors };
}

async function createRentalSpaces(vendors) {
  const zones = ['North Block', 'East Block', 'Central Block', 'West Block'];
  const spaces = [];

  for (let vendorIndex = 0; vendorIndex < vendors.length; vendorIndex += 1) {
    for (let localIndex = 0; localIndex < 2; localIndex += 1) {
      const space = await prisma.rentalSpace.create({
        data: {
          vendorId: vendors[vendorIndex].user.id,
          location: `${vendors[vendorIndex].profile.farmLocation} - ${zones[(vendorIndex + localIndex) % zones.length]}`,
          size: 120 + vendorIndex * 10 + localIndex * 8,
          price: new Prisma.Decimal(80 + vendorIndex * 6 + localIndex * 4),
          availability: RentalAvailability.AVAILABLE,
        },
      });

      spaces.push(space);
    }
  }

  if (spaces[spaces.length - 1]) {
    await prisma.rentalSpace.update({
      where: { id: spaces[spaces.length - 1].id },
      data: { availability: RentalAvailability.UNAVAILABLE },
    });
  }

  return spaces;
}

async function createProducts(vendors) {
  const produceTypes = [
    'Kale',
    'Spinach',
    'Cherry Tomato',
    'Bell Pepper',
    'Lettuce',
    'Mint',
    'Basil',
    'Cucumber',
    'Eggplant',
    'Strawberry',
  ];

  const categories = ['Leafy Greens', 'Herbs', 'Fruit Vegetables', 'Microgreens', 'Seasonal'];

  const products = [];

  for (let index = 0; index < 100; index += 1) {
    const vendor = vendors[index % vendors.length];
    const produceType = produceTypes[index % produceTypes.length];
    const category = categories[index % categories.length];
    const certificationStatus =
      vendor.certificationStatus === CertificationStatus.APPROVED
        ? index % 5 === 0
          ? CertificationStatus.PENDING
          : CertificationStatus.APPROVED
        : vendor.certificationStatus;

    const product = await prisma.produce.create({
      data: {
        vendorId: vendor.user.id,
        name: `${produceType} Batch ${String(index + 1).padStart(3, '0')}`,
        description: `Fresh urban-grown ${produceType.toLowerCase()} cultivated with controlled irrigation and monitored nutrient cycles.`,
        price: new Prisma.Decimal(2.5 + (index % 12) * 0.75),
        category,
        certificationStatus,
        availableQuantity: 40 + (index % 25) * 5,
      },
    });

    products.push(product);
  }

  return products;
}

async function createBookingsAndPlantTracking(customers, spaces) {
  const bookings = [];

  for (let index = 0; index < 14; index += 1) {
    const space = spaces[index];
    const customer = customers[index % customers.length];
    const durationDays = 5 + (index % 10);
    const status =
      index % 5 === 0
        ? RentalBookingStatus.CANCELLED
        : index % 3 === 0
          ? RentalBookingStatus.COMPLETED
          : RentalBookingStatus.CONFIRMED;

    const startDate = daysFromNow(2 + index);
    const endDate = daysFromNow(2 + index + durationDays);

    const booking = await prisma.rentalBooking.create({
      data: {
        rentalSpaceId: space.id,
        customerId: customer.id,
        vendorId: space.vendorId,
        startDate,
        endDate,
        totalPrice: new Prisma.Decimal(space.price).mul(durationDays),
        status,
      },
    });

    bookings.push(booking);

    if (status === RentalBookingStatus.CONFIRMED) {
      await prisma.rentalSpace.update({
        where: { id: space.id },
        data: { availability: RentalAvailability.OCCUPIED },
      });
    }
  }

  const nonCancelledBookings = bookings.filter((booking) => booking.status !== RentalBookingStatus.CANCELLED);
  const growthStages = ['SEEDLING', 'VEGETATIVE', 'FLOWERING', 'HARVEST_READY'];
  const healthStatuses = ['GOOD', 'GOOD', 'EXCELLENT', 'FAIR'];

  for (let index = 0; index < nonCancelledBookings.length; index += 1) {
    const booking = nonCancelledBookings[index];

    await prisma.plantTracking.create({
      data: {
        userId: booking.customerId,
        rentalBookingId: booking.id,
        plantName: index % 2 === 0 ? 'Roma Tomato' : 'Butterhead Lettuce',
        growthStage: growthStages[index % growthStages.length],
        healthStatus: healthStatuses[index % healthStatuses.length],
        expectedHarvestDate: daysFromNow(30 + index * 2),
        notes: 'Nutrient mix adjusted after weekly growth check.',
      },
    });
  }

  for (let index = 0; index < customers.length; index += 1) {
    await prisma.plantTracking.create({
      data: {
        userId: customers[index].id,
        plantName: index % 2 === 0 ? 'Basil' : 'Swiss Chard',
        growthStage: 'VEGETATIVE',
        healthStatus: 'GOOD',
        expectedHarvestDate: daysFromNow(20 + index),
        notes: 'Standalone balcony planter update.',
      },
    });
  }

  return bookings;
}

async function createOrders(customers, products) {
  const orderStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ];

  const orders = [];

  for (let index = 0; index < 36; index += 1) {
    const customer = customers[index % customers.length];
    const product = products[(index * 3) % products.length];
    const quantity = 1 + (index % 6);
    const status = orderStatuses[index % orderStatuses.length];
    const unitPrice = new Prisma.Decimal(product.price);

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        produceId: product.id,
        vendorId: product.vendorId,
        quantity,
        unitPrice,
        totalPrice: unitPrice.mul(quantity),
        status,
        orderDate: daysAgo(18 - (index % 12)),
      },
    });

    orders.push(order);
  }

  return orders;
}

async function createCommunityPosts(admin, customers, vendors) {
  const postAuthors = [admin, ...customers.slice(0, 4), ...vendors.slice(0, 4).map((vendor) => vendor.user)];

  const postTemplates = [
    'Tested a new compost tea schedule this week and growth rates improved by 12%.',
    'Looking for recommendations on low-noise rooftop irrigation pumps.',
    'Weekly urban farm meetup starts Friday at 6 PM near Gulshan Lake.',
    'Sharing a pest-control checklist that worked for our leafy greens rack.',
    'Does anyone track EC drift in NFT systems daily? Curious about your ranges.',
    'Community harvest exchange is open for registrations this weekend.',
  ];

  const records = [];

  for (let index = 0; index < 24; index += 1) {
    const author = postAuthors[index % postAuthors.length];
    records.push({
      userId: author.id,
      postContent: postTemplates[index % postTemplates.length],
      postDate: daysAgo(index),
      createdAt: daysAgo(index),
      updatedAt: daysAgo(Math.max(index - 1, 0)),
    });
  }

  await prisma.communityPost.createMany({
    data: records,
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await resetDatabase();

  const { admin, customers, vendors } = await createUsersAndProfiles(passwordHash);
  const spaces = await createRentalSpaces(vendors);
  const products = await createProducts(vendors);

  await createBookingsAndPlantTracking(customers, spaces);
  await createOrders(customers, products);
  await createCommunityPosts(admin, customers, vendors);

  console.log('Seed completed successfully.');
  console.log(`Admin: admin@greengrid.local / ${DEFAULT_PASSWORD}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Vendors: ${vendors.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Rental spaces: ${spaces.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
