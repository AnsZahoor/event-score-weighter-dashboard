
// Enhanced dummy PrismaClient for browser environments
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
    },
    upsert: async () => {
      console.log("Browser environment: Mock upsert for profile");
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

// More reliable browser detection
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Create a safer export that doesn't try to import PrismaClient in the browser
let prisma;

if (!isBrowser) {
  // Server environment - import and use actual PrismaClient
  try {
    const { PrismaClient } = require('@prisma/client');
    
    // For global type in Node environment
    const globalForPrisma = global as unknown as { prisma: typeof PrismaClient };
    
    // Use existing instance if available, otherwise create new
    prisma = globalForPrisma.prisma || new PrismaClient();
    
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  } catch (e) {
    console.error("Failed to initialize Prisma client:", e);
    prisma = dummyPrismaClient;
  }
} else {
  // Browser environment - use dummy client
  console.log("Browser environment detected: Using mock Prisma client");
  prisma = dummyPrismaClient;
}

export default prisma;
