import NodeCache from 'node-cache';

// Create cache instance with TTL of 5 minutes
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Don't clone objects for better performance
});

// Cache middleware factory
export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create cache key from URL and user ID
    const key = `${req.originalUrl}_${req.user?.id || 'anonymous'}`;
    
    // Try to get cached response
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`Cache hit for key: ${key}`);
      return res.json(cachedResponse);
    }
    
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to cache the response
    res.json = function(data) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(key, data, duration);
        console.log(`Cached response for key: ${key}`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache for specific user
export const clearUserCache = (userId) => {
  const keys = cache.keys();
  const userKeys = keys.filter(key => key.includes(userId));
  
  userKeys.forEach(key => {
    cache.del(key);
  });
  
  console.log(`Cleared ${userKeys.length} cache entries for user ${userId}`);
};

// Clear all cache
export const clearAllCache = () => {
  cache.flushAll();
  console.log('Cleared all cache entries');
};

// Get cache statistics
export const getCacheStats = () => {
  return cache.getStats();
};

export default cache;