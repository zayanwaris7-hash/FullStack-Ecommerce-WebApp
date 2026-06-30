// defing all the schema od my database using drizzle orm(instead of using raw sql its better),




import { relations } from 'drizzle-orm';
import { pgTable, serial, integer,text, timestamp, boolean, varchar, uuid, jsonb } from 'drizzle-orm/pg-core';

//some data types 

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type UserRole = "support" | "admin" | "customer";
export type checkoutSessionLine={
    productId:string;
    quantity:number;
    price:number;
}

// Example: Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull().unique(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  //role is from the type define above 
  role: text('role').$type<UserRole>().notNull().default("customer"),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products= pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(""),
  price: integer('price').notNull(),
  imageurl: text('image_url').default(""),
  imageKitFileId: text('image_kit_file_id').default(""),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),    
  active: boolean('active').default(true).notNull(),


});

export const checkoutSessions = pgTable('checkout_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    polerCheckoutId:text('poler_checkout_id'),
    totalprice: integer('total_price').notNull(),
    currency:text('currency').default("pkr"),
    status:text('status').default("pending"),
    //one user has multiple check out session each session having multiple products
    lines:jsonb('lines').$type<checkoutSessionLine[]>().notNull(), // Array of { productId, quantity, price }
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').$type<OrderStatus>().notNull().default("pending"),
    polerCheckoutId:text('poler_checkout_id'),
    polerOrderId:text('poler_order_id').notNull(),
    totalprice: integer('total_price').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
 
export const orderItems= pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(),
});



//relations 

export const userRelation=relations(users, ({ many}) => ({
    orders: many(orders),
}));

export const productRelation=relations(products, ({ many}) => ({
    orderItems: many(orderItems),
}));

export const orderRelation=relations(orders, ({ one, many}) => ({
    user:one(users,{ fields:[orders.userId],references:[users.id] }),
    items: many(orderItems)
}));

export const orderItemRelation=relations(orderItems, ({ one}) => ({
    order:one(orders,{ fields:[orderItems.orderId],references:[orders.id] }),
    product:one(products,{ fields:[orderItems.productId],references:[products.id] }),
}));
