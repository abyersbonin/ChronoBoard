import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSettingsSchema, insertCalendarEventSchema, type WeatherData } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Settings endpoints
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let settings = await storage.getSettings(userId);
      if (!settings) {
        settings = await storage.updateSettings(userId, {});
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertSettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(userId, validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Header image upload
  app.post("/api/upload-header-image", upload.single('image'), async (req: Request & { file?: any }, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const fileName = `header-${Date.now()}.${req.file.originalname.split('.').pop()}`;
      const newPath = path.join('uploads', fileName);
      
      fs.renameSync(req.file.path, newPath);
      
      const imageUrl = `/uploads/${fileName}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Calendar events endpoints
  app.get("/api/calendar-events/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { start, end } = req.query;
      
      const startDate = start ? new Date(start as string) : undefined;
      const endDate = end ? new Date(end as string) : undefined;
      
      const events = await storage.getCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar-events/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(userId, validatedData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Google Calendar sync
  app.post("/api/sync-google-calendar/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getSettings(userId);
      
      if (!settings?.googleCalendarToken) {
        return res.status(400).json({ error: "Google Calendar not connected" });
      }

      // Call Google Calendar API
      const googleCalendarApi = `https://www.googleapis.com/calendar/v3/calendars/primary/events`;
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(`${googleCalendarApi}?timeMin=${now.toISOString()}&timeMax=${oneWeekFromNow.toISOString()}&singleEvents=true&orderBy=startTime`, {
        headers: {
          'Authorization': `Bearer ${settings.googleCalendarToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      const googleEvents = data.items || [];

      // Convert Google Calendar events to our format
      const events = googleEvents.map((gEvent: any) => ({
        id: gEvent.id,
        title: gEvent.summary || 'Untitled Event',
        description: gEvent.description || '',
        location: gEvent.location || '',
        startTime: new Date(gEvent.start.dateTime || gEvent.start.date),
        endTime: new Date(gEvent.end.dateTime || gEvent.end.date),
        isAllDay: !gEvent.start.dateTime,
        googleEventId: gEvent.id,
      }));

      const syncedEvents = await storage.syncCalendarEvents(userId, events);
      res.json({ 
        success: true, 
        eventCount: syncedEvents.length,
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Google Calendar sync error:', error);
      res.status(500).json({ error: "Failed to sync with Google Calendar" });
    }
  });

  // Weather data endpoint
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
      
      if (apiKey === "demo_key") {
        return res.status(400).json({ error: "Weather API key not configured" });
      }

      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // 4-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      // Process forecast data to get daily forecasts
      const dailyForecasts = [];
      const processedDates = new Set();

      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!processedDates.has(dateKey) && dailyForecasts.length < 4) {
          processedDates.add(dateKey);
          dailyForecasts.push({
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0].description,
            icon: item.weather[0].icon,
          });
        }
      }

      const weatherData: WeatherData = {
        location: currentData.name,
        current: {
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
        },
        forecast: dailyForecasts,
      };

      res.json(weatherData);
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
