import { type User, type InsertUser, type Settings, type InsertSettings, type CalendarEvent, type InsertCalendarEvent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSettings(userId: string): Promise<Settings | undefined>;
  updateSettings(userId: string, settings: Partial<InsertSettings>): Promise<Settings>;
  
  getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(eventId: string, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(eventId: string): Promise<boolean>;
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
    
    // Add temporary ongoing event for demonstration
    const tempEvent = {
      id: 'temp-ongoing-cold-event',
      title: 'Les pouvoirs extraordinaires du froid (bilingual)',
      description: 'Événement actuellement en cours - Démonstration de la section À Présent',
      location: 'Spa Eastman',
      startTime: new Date('2025-07-26T19:00:00.000Z'),
      endTime: new Date('2025-07-26T20:00:00.000Z'),
      isAllDay: false,
      icalEventId: 'temp-ongoing-cold-event',
      calendarSource: 'manual-entry',
      lastSynced: new Date()
    };
    this.calendarEvents.set(tempEvent.id, tempEvent);
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

export const storage = new MemStorage();
