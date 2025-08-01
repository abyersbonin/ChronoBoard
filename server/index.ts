import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { validateEnvironment, setupGracefulShutdown, getOptimalPort } from "./deployment";

const app = express();

// Add health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment in production
    if (process.env.NODE_ENV === 'production') {
      if (!validateEnvironment()) {
        log('Environment validation failed, exiting...');
        process.exit(1);
      }
    }
    
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details for debugging
    log(`Error ${status}: ${message}`);
    if (process.env.NODE_ENV === 'development') {
      log(`Stack: ${err.stack}`);
    }

    res.status(status).json({ message });
    
    // Don't throw in production as it would crash the server
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Get optimal port for the environment
  const port = getOptimalPort();
  
  // Add error handling for server startup
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      log(`Port ${port} is already in use. Trying to bind to a different port...`);
    } else {
      log(`Server error: ${error.message}`);
    }
    process.exit(1);
  });

  server.listen(port, "0.0.0.0", () => {
    log(`🚀 Server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`Host: 0.0.0.0`);
    log(`Health check: /health`);
    
    // Set up graceful shutdown handling
    setupGracefulShutdown(server);
  });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
