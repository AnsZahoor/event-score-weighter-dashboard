
import { PrismaClient } from '@prisma/client';

// Create a more comprehensive dummy PrismaClient for browser environments
const dummyPrismaClient = {
  economicEvent: {
    findMany: async () => {
      console.log("Browser environment: Using mock data for economicEvent.findMany");
      return [];
    },
    upsert: async () => {
      console.log("Browser environment: Cannot persist data in browser with economicEvent.upsert");
      return null;
    },
    count: async () => {
      console.log("Browser environment: Using mock data for economicEvent.count");
      return 0;
    }
  },
  profile: {
    findUnique: async () => {
      console.log("Browser environment: Using mock data for profile.findUnique");
      return null;
    }
  },
  userRole: {
    findUnique: async () => {
      console.log("Browser environment: Using mock data for userRole.findUnique");
      return null;
    }
  }
};

// Better environment detection
const isBrowser = typeof window !== 'undefined' && typeof process === 'undefined';

// Create the appropriate client based on the environment
let prisma: any;

if (!isBrowser) {
  // Server-side: Use actual Prisma Client
  try {
    // For global type in Node environment
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    
    // Use existing instance if available, otherwise create new
    prisma = globalForPrisma.prisma || new PrismaClient();
    
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  } catch (e) {
    console.error("Failed to initialize Prisma client:", e);
    prisma = dummyPrismaClient;
  }
} else {
  // Client-side: Use dummy client
  console.log("Browser environment detected: Using mock Prisma client");
  prisma = dummyPrismaClient;
}

export default prisma;
