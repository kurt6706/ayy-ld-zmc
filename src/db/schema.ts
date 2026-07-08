import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull(),
  surname: text('surname').default(''),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'), // 'admin' or 'member'
  status: text('status').notNull().default('approved'), // 'approved', 'pending'
  statusText: text('status_text').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const googleTokens = pgTable('google_tokens', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }).unique(),
  accessToken: text('access_token').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const clubTasks = pgTable('club_tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  notes: text('notes').default(''),
  status: text('status').notNull().default('needsAction'), // 'needsAction' or 'completed'
  dueDate: text('due_date').default(''),
  googleTaskId: text('google_task_id').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clubSheets = pgTable('club_sheets', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  sheetId: text('sheet_id').notNull(),
  url: text('url').notNull(),
  description: text('description').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clubDriveFiles = pgTable('club_drive_files', {
  id: serial('id').primaryKey(),
  fileId: text('file_id').notNull().unique(),
  name: text('name').notNull(),
  webViewLink: text('web_view_link').notNull(),
  mimeType: text('mime_type').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clubCalendarEvents = pgTable('club_calendar_events', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').default(''),
  location: text('location').default(''),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
