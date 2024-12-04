interface StoreConfig {
  persistence?: 'indexedDB' | 'localStorage';
  compression?: boolean;
  encryption?: boolean;
  dbName?: string;
  storeName?: string;
}

interface StoredItem<T> {
  id: string;
  value: T;
  timestamp: number;
}

type StoreError = {
  code: string;
  message: string;
  name: string;
};

export class VirtualStore {
  private db: IDBDatabase | null = null;
  private readonly compression: boolean;
  private readonly encryption: boolean;
  private readonly dbName: string;
  private readonly storeName: string;

  constructor(config: StoreConfig = {}) {
    this.compression = config.compression || false;
    this.encryption = config.encryption || false;
    this.dbName = config.dbName || 'p2js-store';
    this.storeName = config.storeName || 'cache';
    
    if (config.persistence === 'indexedDB') {
      void this.initIndexedDB();
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(this.createError('DB_INIT_ERROR', request.error));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.initIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(this.createError('GET_ERROR', request.error));
      request.onsuccess = () => {
        const storedItem = request.result as StoredItem<T> | undefined;
        
        if (!storedItem) {
          resolve(null);
          return;
        }
        
        let value = storedItem.value;
        
        if (this.compression) {
          value = this.decompress(value);
        }
        if (this.encryption) {
          value = this.decrypt(value);
        }
        
        resolve(value);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    
    let processedValue = value;
    if (this.compression) {
      processedValue = this.compress(processedValue);
    }
    if (this.encryption) {
      processedValue = this.encrypt(processedValue);
    }
    
    const item: StoredItem<T> = {
      id: key,
      value: processedValue,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);
      
      request.onerror = () => reject(this.createError('SET_ERROR', request.error));
      request.onsuccess = () => resolve();
    });
  }

  private createError(code: string, originalError: Error | null | undefined): StoreError {
    return {
      code,
      message: originalError?.message || 'Unknown error',
      name: originalError?.name || 'StoreError'
    };
  }

  private compress<T>(data: T): T {
    // Implement compression logic here
    // For now, return as is
    return data;
  }

  private decompress<T>(data: T): T {
    // Implement decompression logic here
    // For now, return as is
    return data;
  }

  private encrypt<T>(data: T): T {
    // Implement encryption logic here
    // For now, return as is
    return data;
  }

  private decrypt<T>(data: T): T {
    // Implement decryption logic here
    // For now, return as is
    return data;
  }
}

export const createStore = (config?: StoreConfig): VirtualStore => {
  return new VirtualStore(config);
};
