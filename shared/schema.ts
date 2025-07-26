import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  dashboardTitle: text("dashboard_title").default("Personal Dashboard"),
  headerImageUrl: text("header_image_url"),
  autoRefresh: boolean("auto_refresh").default(true),
  use24Hour: boolean("use_24_hour").default(true),
  googleCalendarToken: text("google_calendar_token"),
  weatherApiKey: text("weather_api_key"),
  location: text("location").default("Montreal"),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isAllDay: boolean("is_all_day").default(false),
  googleEventId: text("google_event_id"),
  lastSynced: timestamp("last_synced").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  lastSynced: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type WeatherData = {
  location: string;
  current: {
    temp: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
};
