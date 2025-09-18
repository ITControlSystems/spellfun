export interface User {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  userId: string;
  name: string;
  words: string[];
  createdAt: Date;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  userId: string;
  successfulCompletions: number;
  lastPracticed: Date;
}

class IndexedDBService {
  private dbName = 'SpellFunDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('name', 'name', { unique: false });
        }

        // Create lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonsStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonsStore.createIndex('userId', 'userId', { unique: false });
        }

        // Create lessonProgress store
        if (!db.objectStoreNames.contains('lessonProgress')) {
          const progressStore = db.createObjectStore('lessonProgress', { keyPath: 'id' });
          progressStore.createIndex('lessonId', 'lessonId', { unique: false });
          progressStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // User methods
  async createUser(name: string): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    };

    const store = await this.getStore('users', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(user);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(id: string): Promise<User | null> {
    const store = await this.getStore('users');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Lesson methods
  async createLesson(userId: string, name: string, words: string[]): Promise<Lesson> {
    const lesson: Lesson = {
      id: crypto.randomUUID(),
      userId,
      name,
      words,
      createdAt: new Date(),
    };

    const store = await this.getStore('lessons', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.add(lesson);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return lesson;
  }

  async getLessonsByUserId(userId: string): Promise<Lesson[]> {
    const store = await this.getStore('lessons');
    const index = store.index('userId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const store = await this.getStore('lessons');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Progress methods
  async getLessonProgress(lessonId: string, userId: string): Promise<LessonProgress | null> {
    const store = await this.getStore('lessonProgress');
    const index = store.index('lessonId');
    return new Promise((resolve, reject) => {
      const request = index.getAll(lessonId);
      request.onsuccess = () => {
        const progress = request.result.find(p => p.userId === userId);
        resolve(progress || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateLessonProgress(lessonId: string, userId: string, successfulCompletions: number): Promise<LessonProgress> {
    const existingProgress = await this.getLessonProgress(lessonId, userId);
    
    const progress: LessonProgress = existingProgress || {
      id: crypto.randomUUID(),
      lessonId,
      userId,
      successfulCompletions: 0,
      lastPracticed: new Date(),
    };

    progress.successfulCompletions = successfulCompletions;
    progress.lastPracticed = new Date();

    const store = await this.getStore('lessonProgress', 'readwrite');
    await new Promise<void>((resolve, reject) => {
      const request = store.put(progress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return progress;
  }

  async clearDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Close any existing connections first
      if (this.db) {
        this.db.close();
        this.db = null;
      }

      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onsuccess = () => {
        console.log('Database cleared successfully');
        // Reset the db reference
        this.db = null;
        resolve();
      };
      
      request.onerror = () => {
        console.error('Error clearing database:', request.error);
        reject(request.error);
      };
      
      request.onblocked = () => {
        console.warn('Database clear blocked - please close other tabs');
        // Try again after a short delay
        setTimeout(() => {
          const retryRequest = indexedDB.deleteDatabase(this.dbName);
          retryRequest.onsuccess = () => {
            console.log('Database cleared successfully on retry');
            this.db = null;
            resolve();
          };
          retryRequest.onerror = () => reject(retryRequest.error);
        }, 1000);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
