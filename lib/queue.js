class Queue {
  constructor(limit, timeout = 0) {
    this.limit = limit;
    this.timeout = timeout;
    this.slot = [];
    this.q = [];
  }

  queue(asyncFunc, name) {
    let _self = this;

    console.log(`queue: job ${name} queued`);
    let job = new Promise( (resolve, reject) => {
      _self.q.push({
        'name':      name,
        'run':       asyncFunc,
        'resolver':  resolve,
        'rejector':  reject,
        'timeout':   false,
        'timeoutid': undefined
      });
    });
    _self.dequeue();

    return job;
  }

  dequeue() {
    let _self = this;

    if (_self.slot.length < _self.limit && _self.q.length >= 1) {
      let job = _self.q.shift();
      _self.slot.push(job);
      console.log(`queue: job ${job.name} started`);
      if (_self.timeout) job.timeoutid = setTimeout(_self.jobTimeout.bind(_self, job), _self.timeout);
      job.run( (data) => {
        if (job.timeout) {
          job = null;
          return;
        }

        _self.removeJob(job);
        setTimeout(_self.dequeue.bind(_self), 500 + Math.floor(Math.random() * 100));
        if (job.timeoutid) clearTimeout(job.timeoutid);
        console.log(`queue: job ${job.name} resolved`);
        job.resolver(data);
        job = null;

      }, (reason) => {
        if (job.timeout) {
          job = null;
          return;
        }

        _self.removeJob(job);
        setTimeout(_self.dequeue.bind(_self), 500 + Math.floor(Math.random() * 100));
        if (job.timeoutid) clearTimeout(job.timeoutid);
        console.log(`queue: job ${job.name} rejected`);
        job.rejector(reason);
        job = null;
      });
    }
  }

  jobTimeout(job) {
    this.removeJob(job);
    console.log(`queue: job ${job.name} timeout`);
    job.rejector(new Error(`queue: job ${job.name || ''} timeout`));
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
