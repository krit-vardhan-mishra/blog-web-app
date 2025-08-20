class KeepAliveService {
  constructor() {
    this.pingInterval = null;
    this.isProduction = process.env.NODE_ENV === 'PRODUCTION';
    this.serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
  }

  startPinging() {
    if (!this.isProduction) {
      console.log('Keep-alive service disabled in development');
      return;
    }

    console.log('Starting keep-alive service...');
    
    this.pingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.serverUrl}/api/health`);
        const data = await response.json();
        console.log(`Keep-alive ping successful:`, data.timestamp);
      } catch (error) {
        console.error('Keep-alive ping failed:', error.message);
      }
    }, 14 * 60 * 1000);
  }

  stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      console.log('Keep-alive service stopped');
    }
  }
}

const selfPing = async () => {
  if (process.env.NODE_ENV !== 'PRODUCTION') return;
  
  const maxRetries = 3;
  let retryCount = 0;
  
  const ping = async () => {
    try {
      const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
      const response = await fetch(`${serverUrl}/api/health`, {
        method: 'GET',
        headers: { 'User-Agent': 'KeepAlive-Bot' }
      });
      
      if (response.ok) {
        console.log(`Self-ping successful at ${new Date().toISOString()}`);
        return true;
      }
    } catch (error) {
      console.error(`Self-ping attempt ${retryCount + 1} failed:`, error.message);
    }
    return false;
  };
  
  const attemptPing = async () => {
    while (retryCount < maxRetries) {
      const success = await ping();
      if (success) return;
      
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };
  
  setTimeout(() => {
    setInterval(attemptPing, 14 * 60 * 1000);
  }, 60000);
};

export { KeepAliveService, selfPing };
