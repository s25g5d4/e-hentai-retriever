export interface IQueueOption {
  timeout: number;
  delay: number;
};

interface IExecutor<T> {
  (resolve: (value?: T | PromiseLike<T>) => void, reject?: (reason?: any) => void): void;
}

interface IQueueJob<T> {
  name: string;
  run: IExecutor<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  isTimeout: boolean;
  timeoutId?: number;
}

class Queue<T> {
  limit: number;
  timeout: number;
  delay: number;
  slot: IQueueJob<T>[];
  q: IQueueJob<T>[];

  constructor(limit: number, timeout: number = 0, delay: number = 0) {
    this.limit = limit;
    this.timeout = timeout;
    this.delay = delay;
    this.slot = [];
    this.q = [];
  }

  queue(executor: IExecutor<T>, name: string): Promise<T> {
    const job = new Promise<T>( (resolve, reject) => {
      this.q.push({
        name,
        run: executor,
        resolve,
        reject,
        isTimeout: false,
        timeoutId: undefined
      });
    });
    console.log(`queue: job ${name} queued`);
    this.dequeue();

    return job;
  }

  dequeue(): void {
    const { q, slot, limit, timeout, delay } = this;

    if (slot.length < limit && q.length >= 1) {
      const job = q.shift();
      slot.push(job);
      console.log(`queue: job ${job.name} started`);

      if (timeout) {
        job.timeoutId = window.setTimeout(() => this.jobTimeout(job), timeout);
      }

      const onFulfilled = (data?: T) => {
        if (job.isTimeout) {
          return;
        }

        this.removeJob(job);
        window.setTimeout(() => this.dequeue(), delay); // force dequeue() run after current dequeue()
        if (job.timeoutId) {
          window.clearTimeout(job.timeoutId);
        }
        console.log(`queue: job ${job.name} resolved`);

        job.resolve(data);
      };

      const onRejected = (reason?: any) => {
        if (job.isTimeout) {
          return;
        }

        this.removeJob(job);
        setTimeout(() => this.dequeue(), delay);
        if (job.timeoutId) {
          window.clearTimeout(job.timeoutId);
        }
        console.log(`queue: job ${job.name} rejected`);

        job.reject(reason);
      };

      job.run(onFulfilled, onRejected);
    }
  }

  jobTimeout(job: IQueueJob<T>): void {
    this.removeJob(job);
    console.log(`queue: job ${job.name} timeout`);
    job.reject(new Error(`queue: job ${job.name} timeout`));
    job = null;
  }

  removeJob(job: IQueueJob<T>): void {
    let index = this.slot.indexOf(job);
    if (index >= 0) {
      this.slot.splice(index, 1);
      return;
    }

    index = this.q.indexOf(job);
    if (index >= 0) {
      this.q.splice(index, 1);
    }
  }
}

export default Queue;
