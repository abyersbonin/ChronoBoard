import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSettingsSchema, insertCalendarEventSchema, type WeatherData } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import ical from "node-ical";

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
      console.log('Settings update request:', req.body);
      // Temporarily bypass validation for arrays to test iCal functionality
      const settings = await storage.updateSettings(userId, req.body);
      console.log('Updated settings:', settings);
      res.json(settings);
    } catch (error) {
      console.error('Settings error:', error);
      res.status(400).json({ error: `Settings error: ${error.message}` });
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

  // iCal Calendar sync
  app.post("/api/sync-ical-calendar/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getSettings(userId);
      
      if (!settings?.icalUrls || settings.icalUrls.length === 0) {
        return res.status(400).json({ error: "No iCal URLs configured" });
      }

      const allEvents: any[] = [];
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);


      // Fetch and parse each iCal URL
      for (const icalUrl of settings.icalUrls) {
        try {
          let fetchUrl = icalUrl;
          // Convert Google Calendar embed URLs to iCal format
          if (icalUrl.includes('calendar.google.com/calendar/embed')) {
            const srcMatch = icalUrl.match(/src=([^&]+)/);
            if (srcMatch) {
              const calendarId = decodeURIComponent(srcMatch[1]);
              fetchUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
            }
          }

          const response = await fetch(fetchUrl);
          if (!response.ok) {
            console.error(`Failed to fetch iCal from ${fetchUrl}: ${response.status}`);
            continue;
          }

          const icalData = await response.text();

          
          // Parse iCal data - node-ical main export should have parseICS
          let parsedEvents;
          try {
            if (typeof ical?.parseICS === 'function') {
              parsedEvents = ical.parseICS(icalData);
            } else if (typeof ical === 'function') {
              // Maybe ical is the parser function itself
              parsedEvents = ical(icalData);
            } else {
              throw new Error(`Unsupported ical structure: ${typeof ical}`);
            }

          } catch (parseError) {
            console.error('Parse error:', parseError);
            continue;
          }

          for (const event of Object.values(parsedEvents)) {
            if (event.type === 'VEVENT' && event.start && event.end) {
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              
              // Include events that are currently happening or starting within the next week
              // Event is relevant if it ends after now AND starts before the end of next week
              if (endDate >= now && startDate <= oneWeekFromNow) {

                allEvents.push({
                  id: event.uid || `${Date.now()}-${Math.random()}`,
                  title: event.summary || 'Untitled Event',
                  description: event.description || '',
                  location: event.location || '',
                  startTime: startDate,
                  endTime: endDate,
                  isAllDay: !event.start.getHours && !event.start.getMinutes,
                  icalEventId: event.uid,
                  calendarSource: fetchUrl,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing iCal URL ${icalUrl}:`, error);
        }
      }

      const syncedEvents = await storage.syncCalendarEvents(userId, allEvents);
      res.json({ 
        success: true, 
        eventCount: syncedEvents.length,
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('iCal sync error:', error);
      res.status(500).json({ error: "Failed to sync with iCal calendars" });
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
