import { prisma } from '../lib/prisma.js';
import { classifyDatabaseError, DatabaseErrorInfo, getSafeDatabaseConfig } from '../utils/databaseError.js';

export async function checkDatabaseHealth(): Promise<DatabaseErrorInfo> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timed out')), 1500)
    );
    await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1'),
      timeoutPromise
    ]);
    return {
      available: true,
      code: 'ok',
      message: 'Database connection is healthy.',
      safeConfig: getSafeDatabaseConfig(),
    };
  } catch (error) {
    return classifyDatabaseError(error);
  }
}
