const PING_URL = 'https://blog-web-app-ngmh.onrender.com/api/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

class ExternalKeepAlive {
  constructor(url = PING_URL) {
    this.url = url;
    this.isRunning = false;
    this.intervalId = null;
    this.consecutiveFailures = 0;
    this.maxFailures = 5;
  }

  async ping() {
    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'External-KeepAlive-Service/1.0'
        },
        timeout: 30000
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Ping successful at ${new Date().toISOString()}`);
        console.log(`Server uptime: ${Math.floor(data.uptime)} seconds`);
        this.consecutiveFailures = 0;
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`❌ Ping failed (${this.consecutiveFailures}/${this.maxFailures}):`, error.message);
      
      if (this.consecutiveFailures >= this.maxFailures) {
        console.error('🚨 Max consecutive failures reached. Stopping keep-alive service.');
        this.stop();
      }
      return false;
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log(`🚀 Starting keep-alive service for ${this.url}`);
    console.log(`📅 Ping interval: ${PING_INTERVAL / 60000} minutes`);
    
    this.isRunning = true;
    
    this.ping();
    
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.ping();
      }
    }, PING_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Keep-alive service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      url: this.url,
      consecutiveFailures: this.consecutiveFailures,
      maxFailures: this.maxFailures
    };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const keepAlive = new ExternalKeepAlive();
  
  process.on('SIGINT', () => {
    console.log('\n🔄 Gracefully shutting down...');
    keepAlive.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Received SIGTERM, shutting down...');
    keepAlive.stop();
    process.exit(0);
  });

  keepAlive.start();
}

export default ExternalKeepAlive;
