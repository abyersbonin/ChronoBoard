import { type User, type InsertUser, type InsertAdmin, type Settings, type InsertSettings, type CalendarEvent, type InsertCalendarEvent } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, settings, calendarEvents } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateAdmin(username: string, password: string): Promise<boolean>;
  
  getSettings(userId: string): Promise<Settings | undefined>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings>;
  
  getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(eventId: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(eventId: string): Promise<boolean>;
  clearCalendarEvents(userId: string): Promise<void>;
  syncCalendarEvents(userId: string, events: InsertCalendarEvent[]): Promise<CalendarEvent[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private settings: Map<string, Settings>;
  private calendarEvents: Map<string, CalendarEvent>;

  constructor() {
    this.users = new Map();
    this.settings = new Map();
    this.calendarEvents = new Map();
    
    // Initialize default admin user
    this.createUser({ username: "admin", password: "admin" });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    // Simple validation - in production, passwords should be hashed
    return username === "admin" && password === "admin";
  }

  async getSettings(userId: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(s => s.userId === userId);
  }

  async updateSettings(userId: string, newSettings: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings(userId);
    const settings: Settings = {
      id: existing?.id || randomUUID(),
      userId,
      dashboardTitle: "Personal Dashboard",
      headerImageUrl: null,
      autoRefresh: true,
      use24Hour: true,
      icalUrls: [],
      location: "Montreal",
      ...existing,
      ...newSettings,
    };
    this.settings.set(settings.id, settings);
    return settings;
  }

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const allEvents = Array.from(this.calendarEvents.values());
    let events = allEvents.filter(event => {
      // For demo purposes, we don't filter by userId in memory storage
      return true;
    });

    if (startDate) {
      events = events.filter(event => new Date(event.startTime) >= startDate);
    }
    if (endDate) {
      events = events.filter(event => new Date(event.startTime) <= endDate);
    }

    return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createCalendarEvent(userId: string, insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = insertEvent.id || randomUUID();
    const event: CalendarEvent = {
      ...insertEvent,
      id,
      location: insertEvent.location || null,
      description: insertEvent.description || null,
      isAllDay: insertEvent.isAllDay || false,
      icalEventId: insertEvent.icalEventId || null,
      calendarSource: insertEvent.calendarSource || null,
      lastSynced: new Date(),
    };
    this.calendarEvents.set(id, event);
    return event;
  }

  async updateCalendarEvent(eventId: string, updateEvent: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const existing = this.calendarEvents.get(eventId);
    if (!existing) return undefined;

    const updated: CalendarEvent = {
      ...existing,
      ...updateEvent,
      lastSynced: new Date(),
    };
    this.calendarEvents.set(eventId, updated);
    return updated;
  }

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    return this.calendarEvents.delete(eventId);
  }

  async clearCalendarEvents(userId: string): Promise<void> {
    // Clear all events - memory storage doesn't track userId for events  
    this.calendarEvents.clear();
  }

  async syncCalendarEvents(userId: string, events: InsertCalendarEvent[]): Promise<CalendarEvent[]> {
    // Clear existing events for this sync
    const existingEvents = await this.getCalendarEvents(userId);
    for (const event of existingEvents) {
      if (event.icalEventId) {
        this.calendarEvents.delete(event.id);
      }
    }

    // Add new events
    const syncedEvents: CalendarEvent[] = [];
    for (const eventData of events) {
      const event = await this.createCalendarEvent(userId, eventData);
      syncedEvents.push(event);
    }

    return syncedEvents;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    return username === "admin" && password === "admin";
  }

  async getSettings(userId: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.userId, userId));
    return setting || undefined;
  }

  async updateSettings(userId: string, newSettings: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set(newSettings)
        .where(eq(settings.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({
          userId,
          dashboardTitle: "Personal Dashboard",
          headerImageUrl: null,
          autoRefresh: true,
          use24Hour: true,
          icalUrls: [],
          location: "Montreal",
          ...newSettings,
        })
        .returning();
      return created;
    }
  }

  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    const events = await db.select().from(calendarEvents);
    return events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createCalendarEvent(userId: string, insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const eventData = {
      ...insertEvent,
      location: insertEvent.location || null,
      description: insertEvent.description || null,
      isAllDay: insertEvent.isAllDay || false,
      icalEventId: insertEvent.icalEventId || null,
      calendarSource: insertEvent.calendarSource || null,
      lastSynced: new Date(),
    };
    
    const [event] = await db
      .insert(calendarEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async updateCalendarEvent(eventId: string, updateEvent: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updated] = await db
      .update(calendarEvents)
      .set({
        ...updateEvent,
        lastSynced: new Date(),
      })
      .where(eq(calendarEvents.id, eventId))
      .returning();
    return updated || undefined;
  }

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    const result = await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
    return (result.rowCount || 0) > 0;
  }

  async clearCalendarEvents(userId: string): Promise<void> {
    // Only delete events that came from iCal sync, preserve manually-added events
    const { sql: rawSql } = await import('drizzle-orm');
    await db.delete(calendarEvents).where(
      rawSql`${calendarEvents.icalEventId} IS NOT NULL AND ${calendarEvents.icalEventId} NOT LIKE 'manual-%'`
    );
  }

  async syncCalendarEvents(userId: string, events: InsertCalendarEvent[]): Promise<CalendarEvent[]> {
    // Use upsert (INSERT ... ON CONFLICT ... DO UPDATE) to handle duplicates
    const syncedEvents: CalendarEvent[] = [];
    
    for (const eventData of events) {
      try {
        // Try to insert the event with proper field mapping
        const [event] = await db
          .insert(calendarEvents)
          .values({
            id: eventData.id,
            title: eventData.title,
            description: eventData.description,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            location: eventData.location,
            isAllDay: eventData.isAllDay,
            icalEventId: eventData.icalEventId,
            calendarSource: eventData.calendarSource,
            lastSynced: new Date(),
          })
          .onConflictDoUpdate({
            target: calendarEvents.id,
            set: {
              title: eventData.title,
              description: eventData.description,
              startTime: eventData.startTime,
              endTime: eventData.endTime,
              location: eventData.location,
              calendarSource: eventData.calendarSource,
              lastSynced: new Date(),
            }
          })
          .returning();
        
        syncedEvents.push(event);
      } catch (error) {
        console.error(`Error syncing event ${eventData.id}:`, error);
        // Continue with other events even if one fails
      }
    }

    return syncedEvents;
  }
}

// Check if we have database access, use database storage if available
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
