import {
  pgTable,
  pgEnum,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  integer,
  primaryKey
} from 'drizzle-orm/pg-core';

// Goat status ENUM
export const goatStatusEnum = pgEnum('goat_status', ['active', 'sold', 'sick', 'dead', 'archived']);

// Profiles / Users Table
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
  name: text('name').notNull(),
  currency: text('currency').default('BDT'),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Auth.js Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state')
});

// Auth.js Sessions Table
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull()
});

// Auth.js Verification Tokens Table
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { withTimezone: true }).notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] })
}));

// Expense Categories
export const expenseCategories = pgTable('expense_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Goats Inventory
export const goats = pgTable('goats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  nameOrTag: text('name_or_tag').notNull(),
  breed: text('breed'),
  gender: text('gender'),
  purchasePrice: numeric('purchase_price').notNull(),
  purchaseDate: date('purchase_date').notNull(),
  status: goatStatusEnum('status').default('active').notNull(),
  imageUrl: text('image_url'),
  source: text('source').default('purchased'),
  motherId: uuid('mother_id'),
  fatherId: uuid('father_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Expenses
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => expenseCategories.id),
  amount: numeric('amount').notNull(),
  paidAmount: numeric('paid_amount').default('0'),
  dueAmount: numeric('due_amount').default('0'),
  paymentStatus: text('payment_status').default('due'),
  expenseDate: date('expense_date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Expense to Goat Allocation Map
export const expenseGoatMap = pgTable('expense_goat_map', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').notNull().references(() => goats.id, { onDelete: 'cascade' })
});

// Sales
export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').notNull().unique().references(() => goats.id, { onDelete: 'cascade' }),
  salePrice: numeric('sale_price').notNull(),
  saleDate: date('sale_date').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Owners / Partners
export const owners = pgTable('owners', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sharePercentage: numeric('share_percentage').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Owner Contributions
export const ownerContributions = pgTable('owner_contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => owners.id, { onDelete: 'cascade' }),
  expenseId: uuid('expense_id').references(() => expenses.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').references(() => goats.id, { onDelete: 'cascade' }),
  amount: numeric('amount').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Goat Health Records
export const goatHealthRecords = pgTable('goat_health_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').notNull().references(() => goats.id, { onDelete: 'cascade' }),
  recordType: text('record_type').notNull(),
  recordDate: date('record_date').notNull(),
  name: text('name'),
  notes: text('notes'),
  nextDate: date('next_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Goat Notes
export const goatNotes = pgTable('goat_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').notNull().references(() => goats.id, { onDelete: 'cascade' }),
  note: text('note').notNull(),
  noteDate: date('note_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Goat Images
export const goatImages = pgTable('goat_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }),
  goatId: uuid('goat_id').notNull().references(() => goats.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
