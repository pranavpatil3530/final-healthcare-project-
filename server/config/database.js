import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool & performance settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,

      // Replica set options
      readPreference: 'secondaryPreferred',
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Optional: Listen to connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed (SIGINT)');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const checkDatabaseHealth = async () => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    return { status: 'healthy', ping: result };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

export const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize,
      objects: stats.objects
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

export default connectDB;
