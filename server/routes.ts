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
import session from "express-session";

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

// Extend Express session type to include admin authentication
declare module 'express-session' {
  interface SessionData {
    isAdminLoggedIn: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware setup
  app.use(session({
    secret: 'spa-eastman-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Admin authentication middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.session.isAdminLoggedIn) {
      next();
    } else {
      res.status(401).json({ error: 'Admin authentication required' });
    }
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const isValid = await storage.validateAdmin(username, password);
      
      if (isValid) {
        req.session.isAdminLoggedIn = true;
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: 'Logout failed' });
      } else {
        res.json({ success: true, message: 'Logout successful' });
      }
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isLoggedIn: !!req.session.isAdminLoggedIn });
  });
  // Settings endpoints - protected by admin auth
  app.get("/api/settings/:userId", requireAdmin, async (req, res) => {
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

  app.put("/api/settings/:userId", requireAdmin, async (req, res) => {
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

  // iCal Calendar sync - protected by admin auth
  app.post("/api/sync-ical-calendar/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getSettings(userId);
      
      if (!settings?.icalUrls || settings.icalUrls.length === 0) {
        return res.status(400).json({ error: "No iCal URLs configured" });
      }

      // Clear existing events to ensure fresh data starting from today
      await storage.clearCalendarEvents(userId);
      
      const allEvents: any[] = [];
      const now = new Date();
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const threeMonthsFromNow = new Date(now);
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      console.log(`Syncing events from ${now.toISOString()} to ${threeMonthsFromNow.toISOString()}`);


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

          // Separate collections for different event types
          const singleEvents = [];
          const recurringEvents = [];
          
          // First pass: categorize all events
          for (const [eventKey, event] of Object.entries(parsedEvents) as any[]) {
            if (event.type === 'VEVENT' && event.start && event.end) {
              // Debug events at 9AM Toronto time (1PM UTC)
              if (event.start) {
                const eventStart = new Date(event.start);
                if (eventStart.getHours() === 13 && eventStart.getDate() === 27 && eventStart.getMonth() === 6) {
                  console.log(`Event at July 27 1PM UTC (9AM Toronto): "${event.summary}" UID: ${event.uid}, has recurrences: ${!!event.recurrences}`);
                }
              }
              
              // Debug Marche nordique specifically
              if (event.summary && event.summary.toLowerCase().includes('marche') && event.summary.toLowerCase().includes('nordique')) {
                console.log(`*** Found Marche nordique event: "${event.summary}" from ${event.start} to ${event.end}, recurring: ${!!event.rrule}, recurrences: ${!!event.recurrences}, UID: ${event.uid}`);
                console.log(`*** Raw event data:`, JSON.stringify(event, null, 2));
                if (event.exdate) {
                  console.log(`*** Raw EXDATE data:`, event.exdate);
                }
              }
              
              if (event.rrule) {
                // This is a recurring event (may also have recurrence overrides)
                recurringEvents.push(event);
              } else {
                // This is a single event
                singleEvents.push(event);
              }
            }
          }
          
          console.log(`Found ${singleEvents.length} single events, ${recurringEvents.length} recurring events`);
          
          // Second pass: process single events
          for (const event of singleEvents) {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            
            if (endDate >= now && startDate <= threeMonthsFromNow) {
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
                eventType: 'single'
              };
              
              allEvents.push(singleEvent);
            }
          }
          
          // Third pass: process recurring events and their overrides
          for (const event of recurringEvents) {
            console.log(`ENTERING RRULE PROCESSING for "${event.summary}"`);
            try {
              // Get excluded dates (EXDATE) for this recurring event with proper timezone handling
              const excludedDates = new Set();
              if (event.exdate) {
                console.log(`Event "${event.summary}" has EXDATE:`, event.exdate);
                // Handle both single EXDATE and array of EXDATEs
                const exdates = Array.isArray(event.exdate) ? event.exdate : [event.exdate];
                for (const exdate of exdates) {
                  let exdateObj = new Date(exdate);
                  
                  // Special handling for timezone-aware EXDATE values
                  // If the exdate appears to be in a different timezone than UTC, handle it properly
                  if (exdate && typeof exdate === 'object' && exdate.tz) {
                    // node-ical provides timezone info in the tz property
                    console.log(`  EXDATE with timezone: ${exdate} (tz: ${exdate.tz})`);
                  }
                  
                  console.log(`  EXDATE: ${exdate} -> ${exdateObj.toISOString()} (timestamp: ${exdateObj.getTime()})`);
                  
                  // Add both the exact timestamp and a tolerance range for timezone handling
                  excludedDates.add(exdateObj.getTime());
                  
                  // Add a tolerance range of ±4 hours to handle timezone conversion issues
                  const tolerance = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
                  for (let offset = -tolerance; offset <= tolerance; offset += 60 * 60 * 1000) { // 1-hour increments
                    excludedDates.add(exdateObj.getTime() + offset);
                  }
                }
                console.log(`Event "${event.summary}" has ${excludedDates.size} excluded date entries (including timezone tolerance)`);
              }
              
              // First, add any recurrence overrides (these take priority)
              if (event.recurrences) {
                console.log(`Processing ${Object.keys(event.recurrences).length} recurrence overrides for "${event.summary}"`);
                for (const [recDate, recEvent] of Object.entries(event.recurrences)) {
                  const recEventTyped = recEvent as any; // node-ical recurrence event
                  const overrideStart = new Date(recEventTyped.start);
                  const overrideEnd = new Date(recEventTyped.end);
                  
                  console.log(`  Override: recDate="${recDate}", actualStart="${overrideStart.toISOString()}", summary="${recEventTyped.summary}"`);
                  
                  if (overrideEnd >= now && overrideStart <= threeMonthsFromNow) {
                    // Debug override events
                    if (overrideStart.getDate() === 27 && overrideStart.getMonth() === 6 && overrideStart.getHours() === 13) {
                      console.log(`*** PROCESSING RECURRENCE OVERRIDE for July 27 1PM: "${recEventTyped.summary}"`);
                    }
                    
                    const overrideEvent = {
                      id: `${event.uid}-override-${overrideStart.getTime()}`,
                      title: recEventTyped.summary || event.summary || 'Untitled Event',
                      description: recEventTyped.description || event.description || '',
                      location: recEventTyped.location || event.location || '',
                      startTime: overrideStart,
                      endTime: overrideEnd,
                      isAllDay: !recEventTyped.start.getHours && !recEventTyped.start.getMinutes,
                      icalEventId: `${event.uid}-override-${overrideStart.getTime()}`,
                      calendarSource: fetchUrl,
                      eventType: 'override'
                    };
                    
                    allEvents.push(overrideEvent);
                    
                    // Exclude the original recurrence date, not the override date
                    excludedDates.add(new Date(recDate).getTime());
                  }
                }
              }
              
              // Then generate regular recurring instances
              const instances = event.rrule.between(now, threeMonthsFromNow, true);
              console.log(`Generated ${instances.length} instances for "${event.summary}"`);
              
              for (const instanceStart of instances) {
                // Proper EXDATE handling - always exclude dates that are in EXDATE
                console.log(`  Checking instance: ${instanceStart.toISOString()} (timestamp: ${instanceStart.getTime()}) for "${event.summary}"`);
                if (excludedDates.has(instanceStart.getTime())) {
                  console.log(`  ✓ Skipping excluded date (EXDATE): ${instanceStart.toISOString()} for "${event.summary}"`);
                  continue;
                } else {
                  console.log(`  → Including instance: ${instanceStart.toISOString()} for "${event.summary}"`);
                }
                
                const originalDuration = new Date(event.end).getTime() - new Date(event.start).getTime();
                const instanceEnd = new Date(instanceStart.getTime() + originalDuration);
                
                // Debug specific time slot
                if (instanceStart.getDate() === 27 && instanceStart.getMonth() === 6 && instanceStart.getHours() === 13) {
                  console.log(`*** FOUND July 27 1PM recurring instance: "${event.summary}"`);
                }
                
                const eventInstance = {
                  id: `${event.uid}-${instanceStart.getTime()}`,
                  title: event.summary || 'Untitled Event',
                  description: event.description || '',
                  location: event.location || '',
                  startTime: instanceStart,
                  endTime: instanceEnd,
                  isAllDay: !event.start.getHours && !event.start.getMinutes,
                  icalEventId: `${event.uid}-${instanceStart.getTime()}`,
                  calendarSource: fetchUrl,
                  eventType: 'recurring'
                };
                
                allEvents.push(eventInstance);
              }
            } catch (rruleError) {
              console.error('Error processing recurring event:', rruleError);
            }
          }
        } catch (error) {
          console.error(`Error processing iCal URL ${icalUrl}:`, error);
        }
      }

      // Sort events by time first for better processing
      allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      // Improved deduplication that prioritizes override events
      const deduplicatedEvents: any[] = [];
      const eventMap = new Map();
      
      for (const event of allEvents) {
        // Create a time-based key for events at the same time
        const timeKey = `${event.startTime.getTime()}-${event.endTime.getTime()}`;
        
        const existing = eventMap.get(timeKey);
        if (!existing) {
          eventMap.set(timeKey, event);
          deduplicatedEvents.push(event);
        } else {
          // Priority: override events > single events > recurring events
          const shouldReplace = (
            (event.eventType === 'override') ||
            (event.eventType === 'single' && existing.eventType === 'recurring')
          );
          
          if (shouldReplace) {
            console.log(`Replacing "${existing.title}" with "${event.title}" at ${event.startTime.toISOString()}`);
            // Remove the old event and add the new one
            const index = deduplicatedEvents.findIndex(e => e.id === existing.id);
            if (index >= 0) {
              deduplicatedEvents[index] = event;
              eventMap.set(timeKey, event);
            }
          } else {
            console.log(`Skipping duplicate event: "${event.title}" at ${event.startTime.toISOString()} from ${event.calendarSource}`);
          }
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
      const apiKey = process.env.WEATHER_API_KEY || "bb8213b1aa75181da5c769bde25a25f9";

      // Current weather with French language - ensure we get Eastman, Quebec, Canada
      const locationQuery = location.toLowerCase() === 'eastman' ? 'Eastman,QC,CA' : location;
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationQuery)}&appid=${apiKey}&units=metric&lang=fr`
      );
      
      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      
      // Debug: Log weather data to verify authenticity
      console.log(`Weather API response for ${locationQuery}:`, {
        location: currentData.name,
        temp: currentData.main.temp,
        condition: currentData.weather[0].description,
        coords: currentData.coord,
        country: currentData.sys.country
      });

      // 4-day forecast with French language
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationQuery)}&appid=${apiKey}&units=metric&lang=fr`
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
        
        if (!processedDates.has(dateKey) && dailyForecasts.length < 3) {
          const dayName: string = dailyForecasts.length === 0 ? 'Aujourd\'hui' : 
                                 dailyForecasts.length === 1 ? 'Demain' : 
                                 date.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          processedDates.add(dateKey);
          dailyForecasts.push({
            date: date.toISOString().split('T')[0],
            day: dayName,
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
