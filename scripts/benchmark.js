const { performance } = require('node:perf_hooks');

const BASE_URL = process.env.BENCHMARK_BASE_URL || 'http://localhost:5000';
const EMAIL = process.env.BENCHMARK_EMAIL || 'admin@greengrid.local';
const PASSWORD = process.env.BENCHMARK_PASSWORD || 'Password@123';

const requests = [];

async function timedRequest(label, url, init) {
  const startedAt = performance.now();

  try {
    const response = await fetch(url, init);
    const bodyText = await response.text();
    const durationMs = performance.now() - startedAt;

    const result = {
      label,
      status: response.status,
      durationMs,
      bytes: Buffer.byteLength(bodyText, 'utf8'),
      ok: response.ok,
      bodyText,
    };

    requests.push(result);
    return result;
  } catch (error) {
    const durationMs = performance.now() - startedAt;

    const result = {
      label,
      status: 'ERR',
      durationMs,
      bytes: 0,
      ok: false,
      bodyText: '',
      error: error instanceof Error ? error.message : String(error),
    };

    requests.push(result);
    return result;
  }
}

function printSummary() {
  const sorted = [...requests].sort((a, b) => a.durationMs - b.durationMs);
  const totalMs = requests.reduce((sum, entry) => sum + entry.durationMs, 0);

  console.log('\nBenchmark Summary');
  console.log('=================');

  for (const item of requests) {
    const duration = item.durationMs.toFixed(2).padStart(8, ' ');
    const status = String(item.status).padStart(3, ' ');
    const size = String(item.bytes).padStart(6, ' ');
    const outcome = item.ok ? 'OK ' : 'FAIL';

    console.log(`${duration} ms | ${status} | ${size} B | ${outcome} | ${item.label}`);

    if (item.error) {
      console.log(`  error: ${item.error}`);
    }
  }

  if (sorted.length > 0) {
    const fastest = sorted[0];
    const slowest = sorted[sorted.length - 1];

    console.log('\nStats');
    console.log('-----');
    console.log(`Total requests: ${requests.length}`);
    console.log(`Aggregate time: ${totalMs.toFixed(2)} ms`);
    console.log(`Fastest: ${fastest.label} (${fastest.durationMs.toFixed(2)} ms)`);
    console.log(`Slowest: ${slowest.label} (${slowest.durationMs.toFixed(2)} ms)`);
  }
}

async function run() {
  console.log(`Running benchmark against: ${BASE_URL}`);

  await timedRequest('Health', `${BASE_URL}/health`, {
    method: 'GET',
  });

  await timedRequest('Community list', `${BASE_URL}/api/v1/community-posts?limit=20`, {
    method: 'GET',
  });

  const loginResult = await timedRequest('Auth login', `${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  let accessToken = '';

  try {
    const parsed = JSON.parse(loginResult.bodyText || '{}');
    accessToken = parsed?.data?.accessToken || '';
  } catch (_error) {
    accessToken = '';
  }

  await timedRequest('Produce list', `${BASE_URL}/api/v1/produce?page=1&limit=20`, {
    method: 'GET',
  });

  if (accessToken) {
    await timedRequest('Admin orders list', `${BASE_URL}/api/v1/orders?page=1&limit=20`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } else {
    console.log('Skipping authenticated benchmark step: login failed or no token returned.');
  }

  printSummary();
}

run().catch((error) => {
  console.error('Benchmark script failed:', error);
  process.exitCode = 1;
});
