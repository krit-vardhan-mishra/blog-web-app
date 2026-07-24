import cluster from 'node-cluster';
import os from 'os';

export const setupCluster = (startWorkerServer) => {
  const numCPUs = process.env.WORKER_COUNT ? parseInt(process.env.WORKER_COUNT, 10) : Math.min(os.cpus().length, 4);

  if (cluster.isPrimary || cluster.isMaster) {
    console.log(`🚀 Primary Process (${process.pid}) starting Cluster with ${numCPUs} Workers...`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.warn(`⚠️ Worker process ${worker.process.pid} died (code: ${code}, signal: ${signal}). Spawning replacement...`);
      cluster.fork();
    });
  } else {
    console.log(`⚡ Worker process initialized (PID: ${process.pid})`);
    startWorkerServer();
  }
};

export default setupCluster;
