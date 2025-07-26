import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSettingsSchema, insertCalendarEventSchema, type WeatherData } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import ical from "node-ical";
import { RRule } from "rrule";

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
      res.status(400).json({ error: `Settings error: ${error instanceof Error ? error.message : 'Unknown error'}` });
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

          
          // Parse iCal data using node-ical
          let parsedEvents;
          try {
            parsedEvents = ical.parseICS(icalData);

          } catch (parseError) {
            console.error('Parse error:', parseError);
            continue;
          }

          for (const [eventKey, event] of Object.entries(parsedEvents) as any[]) {
            if (event.type === 'VEVENT' && event.start && event.end) {
              // Debug events at 9AM Toronto time (1PM UTC)
              if (event.start) {
                const eventStart = new Date(event.start);
                if (eventStart.getHours() === 13 && eventStart.getDate() === 27 && eventStart.getMonth() === 6) {
                  console.log(`Event at July 27 1PM UTC (9AM Toronto): "${event.summary}" UID: ${event.uid}`);
                }
              }
              
              // Debug specific event
              if (event.summary && event.summary.toLowerCase().includes('qi') && event.summary.toLowerCase().includes('qong')) {
                console.log(`Found Qi Qong event: "${event.summary}" from ${event.start} to ${event.end}, recurring: ${!!event.rrule}, UID: ${event.uid}`);
              }
              
              // Always process single events first (including recurring event instances)
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              
              // Include events that are currently happening or starting within the next week
              if (endDate >= now && startDate <= oneWeekFromNow) {
                const singleEvent = {
                  id: event.uid || `${Date.now()}-${Math.random()}`,
                  title: event.summary || 'Untitled Event',
                  description: event.description || '',
                  location: event.location || '',
                  startTime: startDate,
                  endTime: endDate,
                  isAllDay: !event.start.getHours && !event.start.getMinutes,
                  icalEventId: event.uid,
                  calendarSource: fetchUrl,
                };
                
                allEvents.push(singleEvent);
              }
              
              // Additionally, handle recurring events to generate future instances
              if (event.rrule) {
                console.log(`ENTERING RRULE PROCESSING for "${event.summary}"`);
                try {
                  // node-ical already provides RRule objects, use them directly
                  const instances = event.rrule.between(now, oneWeekFromNow, true);
                  console.log(`Generated ${instances.length} instances for "${event.summary}"`);
                  
                  for (const instanceStart of instances) {
                    const originalDuration = new Date(event.end).getTime() - new Date(event.start).getTime();
                    const instanceEnd = new Date(instanceStart.getTime() + originalDuration);
                    
                    // Debug specific time slot
                    if (instanceStart.getDate() === 27 && instanceStart.getMonth() === 6 && instanceStart.getHours() === 13) {
                      console.log(`*** FOUND July 27 1PM recurring instance: "${event.summary}"`);
                    }
                    
                    const eventInstance = {
                      id: `${event.uid}-${instanceStart.getTime()}` || `${Date.now()}-${Math.random()}`,
                      title: event.summary || 'Untitled Event',
                      description: event.description || '',
                      location: event.location || '',
                      startTime: instanceStart,
                      endTime: instanceEnd,
                      isAllDay: !event.start.getHours && !event.start.getMinutes,
                      icalEventId: `${event.uid}-${instanceStart.getTime()}`, // Make recurring instances unique
                      calendarSource: fetchUrl,
                    };
                    
                    allEvents.push(eventInstance);
                  }
                } catch (rruleError) {
                  console.error('Error processing recurring event:', rruleError);
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing iCal URL ${icalUrl}:`, error);
        }
      }

      // Sort events by time first for better processing
      allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      // Deduplicate events more aggressively
      const deduplicatedEvents = [];
      const eventMap = new Map();
      
      for (const event of allEvents) {
        // Normalize title by removing extra spaces and converting to lowercase
        const normalizedTitle = event.title.trim().toLowerCase().replace(/\s+/g, ' ');
        
        // Create a unique key for deduplication
        const eventKey = `${normalizedTitle}-${event.startTime.getTime()}-${event.endTime.getTime()}`;
        
        if (!eventMap.has(eventKey)) {
          eventMap.set(eventKey, event);
          deduplicatedEvents.push(event);
        } else {
          console.log(`Skipping duplicate event: "${event.title}" at ${event.startTime.toISOString()} from ${event.calendarSource}`);
        }
      }
      
      console.log(`Total events collected: ${allEvents.length}`);
      console.log(`Deduplicated from ${allEvents.length} to ${deduplicatedEvents.length} events`);
      
      const syncedEvents = await storage.syncCalendarEvents(userId, deduplicatedEvents);
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
