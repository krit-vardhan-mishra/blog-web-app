import autocannon from 'autocannon';

const targetUrl = process.env.TARGET_URL || 'http://localhost:5000/api/health';
const connections = Number(process.env.CONNECTIONS || 500);
const duration = Number(process.env.DURATION || 10);

console.log(`🚀 Starting High-Concurrency Stress Test...`);
console.log(`Target: ${targetUrl}`);
console.log(`Concurrent Connections: ${connections}`);
console.log(`Duration: ${duration}s\n`);

const instance = autocannon({
  url: targetUrl,
  connections: connections,
  duration: duration,
  pipelining: 1,
}, (err, result) => {
  if (err) {
    console.error('❌ Load test failed:', err);
    process.exit(1);
  }

  console.log('\n📊 --- LOAD TEST BENCHMARK RESULTS ---');
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency p95:  ${result.latency.p95} ms`);
  console.log(`Latency p99:  ${result.latency.p99} ms`);
  console.log(`Throughput:   ${(result.throughput.average / (1024 * 1024)).toFixed(2)} MB/sec`);
  console.log(`Total Req:    ${result.requests.total}`);
  console.log(`2xx Responses: ${result['2xx']}`);
  console.log(`Non-2xx Fail:  ${result.non2xx || 0}`);
  console.log('-------------------------------------\n');
});

autocannon.track(instance, { renderProgressBar: true });
