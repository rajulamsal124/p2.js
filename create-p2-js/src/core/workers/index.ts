import { wrap } from 'comlink';

interface WorkerConfig {
  maxWorkers?: number;
  tasks?: string[];
}

interface WorkerAPI {
  processData(data: any): Promise<any>;
  computeHash(data: string): Promise<string>;
  compress(data: any): Promise<any>;
  encrypt(data: any): Promise<any>;
}

class WorkerPool {
  private workers: Worker[] = [];
  private wrappedWorkers: WorkerAPI[] = [];
  private taskQueue: Map<string, Function[]> = new Map();
  private busyWorkers: Set<number> = new Set();

  constructor(config: WorkerConfig = {}) {
    const maxWorkers = config.maxWorkers || navigator.hardwareConcurrency || 4;
    
    // Initialize worker pool
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module'
      });
      this.workers.push(worker);
      this.wrappedWorkers.push(wrap<WorkerAPI>(worker));
    }

    // Setup task types
    (config.tasks || []).forEach(task => {
      this.taskQueue.set(task, []);
    });
  }

  private getAvailableWorker(): { worker: WorkerAPI; index: number } {
    const availableIndex = this.workers.findIndex((_, index) => !this.busyWorkers.has(index));
    if (availableIndex === -1) {
      throw new Error('No available workers');
    }
    return {
      worker: this.wrappedWorkers[availableIndex],
      index: availableIndex
    };
  }

  async run<T>(taskType: string, task: any): Promise<T> {
    const { worker, index } = this.getAvailableWorker();
    this.busyWorkers.add(index);

    try {
      const result = await (worker[taskType as keyof WorkerAPI] as any)(task);
      return result;
    } catch (error) {
      console.error(`Worker task failed: ${error}`);
      throw error;
    } finally {
      this.busyWorkers.delete(index);
    }
  }

  terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.wrappedWorkers = [];
    this.taskQueue.clear();
    this.busyWorkers.clear();
  }
}

export const createWorkerPool = (config?: WorkerConfig): WorkerPool => {
  return new WorkerPool(config);
};
