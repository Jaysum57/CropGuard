/**
 * Profile Data Cache Manager
 * Caches user profile and stats data to reduce database calls
 * Implements TTL (time-to-live) and event-driven invalidation
 */

import { logger } from './logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  website: string | null;
  avatar_url: string | null;
}

interface UserStats {
  plantsScanned: number;
  diseasesDetected: number;
  healthyScans: number;
  accuracy: string;
  lastScan?: string | null; // ISO timestamp of last scan
}

class ProfileCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // can be configured
  private readonly STORAGE_PREFIX = 'cropguard_profile_cache_';

  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  /**
   * Load cache from localStorage on initialization
   */
  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.STORAGE_PREFIX)
        );

        keys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const cacheEntry = JSON.parse(data) as CacheEntry<any>;
              const cacheKey = key.replace(this.STORAGE_PREFIX, '');
              
              // Only load if not expired
              if (cacheEntry.expiresAt > Date.now()) {
                this.cache.set(cacheKey, cacheEntry);
              } else {
                // Clean up expired entries
                localStorage.removeItem(key);
              }
            } catch (e) {
              logger.error('Error parsing profile cache entry:', e);
            }
          }
        });
      }
    } catch (e) {
      logger.error('Error loading profile cache from storage:', e);
    }
  }

  /**
   * Save a cache entry to both memory and localStorage
   */
  private saveToStorage(key: string, entry: CacheEntry<any>) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${key}`,
          JSON.stringify(entry)
        );
      }
    } catch (e) {
      logger.error('Error saving profile cache to storage:', e);
    }
  }

  /**
   * Generate cache key for user profile
   */
  private getProfileKey(userId: string): string {
    return `profile_${userId}`;
  }

  /**
   * Generate cache key for user stats
   */
  private getStatsKey(userId: string): string {
    return `stats_${userId}`;
  }

  /**
   * Set profile data in cache
   */
  setProfile(userId: string, profile: Profile): void {
    const key = this.getProfileKey(userId);
    const now = Date.now();
    const entry: CacheEntry<Profile> = {
      data: profile,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    };

    this.cache.set(key, entry);
    this.saveToStorage(key, entry);
    logger.success(`Profile cached for user ${userId} (expires in ${this.CACHE_DURATION / 60000} minutes)`);
  }

  /**
   * Get profile data from cache
   */
  getProfile(userId: string): Profile | null {
    const key = this.getProfileKey(userId);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.cache(`Profile cache miss for user ${userId}`, 'miss');
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      logger.cache(`Profile cache expired for user ${userId}`, 'expired');
      this.invalidateProfile(userId);
      return null;
    }

    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    logger.cache(`Profile cache hit for user ${userId} (age: ${age}s)`, 'hit');
    return entry.data;
  }

  /**
   * Set user stats in cache
   */
  setStats(userId: string, stats: UserStats): void {
    const key = this.getStatsKey(userId);
    const now = Date.now();
    const entry: CacheEntry<UserStats> = {
      data: stats,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    };

    this.cache.set(key, entry);
    this.saveToStorage(key, entry);
    logger.success(`Stats cached for user ${userId} (expires in ${this.CACHE_DURATION / 60000} minutes)`);
  }

  /**
   * Get user stats from cache
   */
  getStats(userId: string): UserStats | null {
    const key = this.getStatsKey(userId);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.cache(`Stats cache miss for user ${userId}`, 'miss');
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      logger.cache(`Stats cache expired for user ${userId}`, 'expired');
      this.invalidateStats(userId);
      return null;
    }

    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    logger.cache(`Stats cache hit for user ${userId} (age: ${age}s)`, 'hit');
    return entry.data;
  }

  /**
   * Invalidate profile cache for a specific user
   */
  invalidateProfile(userId: string): void {
    const key = this.getProfileKey(userId);
    this.cache.delete(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    }
    logger.cache(`Profile cache invalidated for user ${userId}`, 'invalidated');
  }

  /**
   * Invalidate stats cache for a specific user
   */
  invalidateStats(userId: string): void {
    const key = this.getStatsKey(userId);
    this.cache.delete(key);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    }
    logger.cache(`Stats cache invalidated for user ${userId}`, 'invalidated');
  }

  /**
   * Invalidate all cache entries for a user
   */
  invalidateUser(userId: string): void {
    this.invalidateProfile(userId);
    this.invalidateStats(userId);
    logger.cache(`All cache invalidated for user ${userId}`, 'invalidated');
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
    }
    logger.cache('All profile cache cleared', 'invalidated');
  }

  /**
   * Get cache statistics
   */
  getStats_CacheInfo(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const profileCache = new ProfileCache();
