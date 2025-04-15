
import { PrismaClient } from '@prisma/client';

// Create a dummy PrismaClient for browser environments
const dummyPrismaClient = {
  economicEvent: {
    findMany: async () => {
      console.error("Prisma Client is not available in the browser environment");
      return [];
    },
    upsert: async () => {
      console.error("Prisma Client is not available in the browser environment");
      return null;
    },
    count: async () => {
      console.error("Prisma Client is not available in the browser environment");
      return 0;
    }
  },
  profile: {
    findUnique: async () => {
      console.error("Prisma Client is not available in the browser environment");
      return null;
    }
  },
  userRole: {
    findUnique: async () => {
      console.error("Prisma Client is not available in the browser environment");
      return null;
    }
  }
};

// Check if we're in a Node.js environment
const isNode = typeof window === 'undefined';

// Create the appropriate client based on the environment
let prisma: PrismaClient | typeof dummyPrismaClient;

if (isNode) {
  // Server-side: Use actual Prisma Client
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} else {
  // Client-side: Use dummy client
  prisma = dummyPrismaClient;
}

export default prisma;
