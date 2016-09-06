class Queue {
  constructor(limit, ...options) {
    let timeout, delay;
    if (options.length) {
      if (typeof options[0] === 'object') {
        ({timeout, delay} = options[0]);
      }
      else {
        [timeout, delay] = options;
      }
    }

    this.limit = limit;
    this.timeout = timeout || 0;
    this.delay = delay || 0;
    this.slot = [];
    this.q = [];
  }

  queue(executor, name) {
    console.log(`queue: job ${name} queued`);

    const job = new Promise( (resolve, reject) => {
      this.q.push({
        'name':      name || '',
        'run':       executor,
        'resolve':   resolve,
        'reject':    reject,
        'timeout':   false,
        'timeoutid': undefined
      });
    });
    this.dequeue();

    return job;
  }

  dequeue() {
    const {q, slot, limit, timeout, delay} = this;

    if (slot.length < limit && q.length >= 1) {
      const job = q.shift();
      slot.push(job);
      console.log(`queue: job ${job.name} started`);

      if (timeout) job.timeoutid = setTimeout(this.jobTimeout.bind(this, job), timeout);

      const onFulfilled = data => {
        if (job.timeout) {
          return;
        }

        this.removeJob(job);
        setTimeout(this.dequeue.bind(this), delay); // force dequeue() run after current dequeue()
        if (job.timeoutid) clearTimeout(job.timeoutid);
        console.log(`queue: job ${job.name} resolved`);

        job.resolve(data);
      };

      const onRejected = reason => {
        if (job.timeout) {
          return;
        }

        this.removeJob(job);
        setTimeout(this.dequeue.bind(this), delay);
        if (job.timeoutid) clearTimeout(job.timeoutid);
        console.log(`queue: job ${job.name} rejected`);

        job.reject(reason);
      };

      job.run(onFulfilled, onRejected);
    }
  }

  jobTimeout(job) {
    this.removeJob(job);
    console.log(`queue: job ${job.name} timeout`);
    job.reject(new Error(`queue: job ${job.name || ''} timeout`));
    job = null;
  }

  removeJob(job) {
    let index = this.slot.indexOf(job);
    if (index >= 0) {
      this.slot.splice(index, 1);
      return;
    }

    index = this.q.indexOf(job);
    if (index >= 0) this.q.splice(index, 1);
  }
}

export default Queue;
