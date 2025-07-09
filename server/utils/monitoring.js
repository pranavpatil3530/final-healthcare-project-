import mongoose from 'mongoose';

// Database performance monitoring
export class DatabaseMonitor {
  constructor() {
    this.metrics = {
      queries: 0,
      slowQueries: 0,
      errors: 0,
      connections: 0,
      avgResponseTime: 0
    };
    
    this.responseTimes = [];
    this.maxResponseTimes = 1000; // Keep last 1000 response times
    
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Monitor slow queries
    mongoose.set('debug', (collectionName, method, query, doc, options) => {
      const start = Date.now();
      
      // Override the callback to measure execution time
      if (options && typeof options === 'object') {
        const originalCallback = options.callback;
        options.callback = (...args) => {
          const duration = Date.now() - start;
          this.recordQuery(duration, collectionName, method);
          
          if (originalCallback) {
            originalCallback(...args);
          }
        };
      }
    });
    
    // Monitor connection events
    mongoose.connection.on('connected', () => {
      this.metrics.connections++;
      console.log('Database connection established');
    });
    
    mongoose.connection.on('error', (err) => {
      this.metrics.errors++;
      console.error('Database error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      this.metrics.connections--;
      console.log('Database disconnected');
    });
  }
  
  recordQuery(duration, collection, method) {
    this.metrics.queries++;
    
    // Record slow queries (>100ms)
    if (duration > 100) {
      this.metrics.slowQueries++;
      console.warn(`Slow query detected: ${collection}.${method} took ${duration}ms`);
    }
    
    // Update response times
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }
    
    // Calculate average response time
    this.metrics.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      connectionState: mongoose.connection.readyState,
      connectionStates: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }[mongoose.connection.readyState],
      slowQueryPercentage: this.metrics.queries > 0 ? 
        (this.metrics.slowQueries / this.metrics.queries * 100).toFixed(2) : 0
    };
  }
  
  async getDetailedStats() {
    try {
      const db = mongoose.connection.db;
      const admin = db.admin();
      
      // Get server status
      const serverStatus = await admin.serverStatus();
      
      // Get database stats
      const dbStats = await db.stats();
      
      // Get collection stats
      const collections = await db.listCollections().toArray();
      const collectionStats = {};
      
      for (const collection of collections) {
        try {
          const stats = await db.collection(collection.name).stats();
          collectionStats[collection.name] = {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            indexSizes: stats.indexSizes
          };
        } catch (error) {
          // Some collections might not support stats
          collectionStats[collection.name] = { error: error.message };
        }
      }
      
      return {
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          network: serverStatus.network,
          opcounters: serverStatus.opcounters
        },
        database: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexSize: dbStats.indexSize,
          objects: dbStats.objects
        },
        collections: collectionStats,
        performance: this.getMetrics()
      };
    } catch (error) {
      console.error('Error getting detailed database stats:', error);
      return { error: error.message };
    }
  }
  
  // Health check
  async healthCheck() {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        metrics: this.getMetrics()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create global monitor instance
export const dbMonitor = new DatabaseMonitor();

// Middleware to track API response times
export const performanceMiddleware = (req, res, next) => {
  const start = Date.now();

  // Monkey-patch res.end to hook into the response just before it's sent
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;

    // Safe to set headers here
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }

    if (duration > 1000) {
      console.warn(`⚠️ Slow API request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }

    return originalEnd.apply(this, args);
  };

  next();
};
