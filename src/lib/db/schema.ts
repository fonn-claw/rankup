import { pgTable, serial, varchar, pgEnum, timestamp, integer, text } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['rep', 'manager', 'admin'])

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('rep'),
  teamId: integer('team_id').references(() => teams.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  xpEarned: integer('xp_earned').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const battles = pgTable('battles', {
  id: serial('id').primaryKey(),
  team1Id: integer('team1_id').references(() => teams.id),
  team2Id: integer('team2_id').references(() => teams.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const challenges = pgTable('challenges', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  goalType: varchar('goal_type', { length: 50 }).notNull(),
  goalValue: integer('goal_value').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
