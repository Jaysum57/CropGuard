/**
 * Disease Data Cache Manager
 * Caches disease data in memory and localStorage to reduce API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class DiseaseCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly ALL_DISEASES_KEY = 'all_diseases';
  private readonly STORAGE_PREFIX = 'cropguard_disease_cache_';

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
              console.error('Error parsing cache entry:', e);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  /**
   * Save cache entry to localStorage
   */
  private saveToStorage(key: string, entry: CacheEntry<any>) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}${key}`,
          JSON.stringify(entry)
        );
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, duration?: number): void {
    const cacheDuration = duration || this.CACHE_DURATION;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration,
    };

    this.cache.set(key, entry);
    this.saveToStorage(key, entry);
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
      }
    } catch (error) {
      console.error('Error deleting from storage:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.STORAGE_PREFIX)
        );
        keys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get all diseases from cache
   */
  getAllDiseases<T = any>(): T[] | null {
    return this.get<T[]>(this.ALL_DISEASES_KEY);
  }

  /**
   * Set all diseases in cache
   */
  setAllDiseases<T = any>(diseases: T[]): void {
    this.set(this.ALL_DISEASES_KEY, diseases);
    
    // Also cache individual diseases for quick lookup
    diseases.forEach((disease: any) => {
      if (disease.id) {
        this.set(`disease_${disease.id}`, disease);
      }
    });
  }

  /**
   * Get single disease from cache
   */
  getDisease<T = any>(id: string): T | null {
    return this.get<T>(`disease_${id}`);
  }

  /**
   * Set single disease in cache
   */
  setDisease<T = any>(disease: T & { id: string }): void {
    this.set(`disease_${disease.id}`, disease);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const diseaseCache = new DiseaseCache();
