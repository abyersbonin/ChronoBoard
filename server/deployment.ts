import { log } from "./vite";

/**
 * Production deployment configuration and utilities
 */

export function validateEnvironment() {
  const requiredVars = ['DATABASE_URL'];
  const optionalVars = ['WEATHER_API_KEY', 'SESSION_SECRET'];
  
  log('Validating environment variables...');
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log(`❌ Missing required environment variable: ${varName}`);
      return false;
    }
    log(`✅ ${varName} is configured`);
  }
  
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log(`✅ ${varName} is configured`);
    } else {
      log(`⚠️  Optional environment variable not set: ${varName}`);
    }
  }
  
  return true;
}

export function setupGracefulShutdown(server: any) {
  // Handle graceful shutdown
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  
  signals.forEach(signal => {
    process.on(signal, () => {
      log(`Received ${signal}, starting graceful shutdown...`);
      
      server.close((err: any) => {
        if (err) {
          log(`Error during server shutdown: ${err}`);
          process.exit(1);
        } else {
          log('Server shut down gracefully');
          process.exit(0);
        }
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        log('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    });
  });
}

export function getOptimalPort(): number {
  // Cloud Run expects port 80, but allow override via PORT env var
  const envPort = process.env.PORT;
  
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (isNaN(port)) {
      log(`Invalid PORT environment variable: ${envPort}, using default 80`);
      return 80;
    }
    return port;
  }
  
  // Default based on environment
  return process.env.NODE_ENV === 'production' ? 80 : 5000;
}