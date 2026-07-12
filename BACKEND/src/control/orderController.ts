import { db } from "../database/index.js";
import { getLocalUser } from "../lib/getUsers.js";
import { isStaff } from "../lib/roles.js";
import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { checkoutSessions, orderItems, orders, products, users } from "../database/schema.js";
import { asc, desc, eq, inArray, } from "drizzle-orm";
import { getEnv } from "../lib/env.js";
import { getStreamChatServer, streamuserid, StreamChatDisplayName } from "../lib/stream.js"
const env = getEnv();
import type { UserRole } from "../database/schema.js"
export async function listOrders(req: Request, res: Response, next: NextFunction) {
  try {

    const { userId, isAuthenticated } = getAuth(req);
    if (!userId || !isAuthenticated) {
      res.status(404).json({ error: "Unautherized Acess" });
      return;
    }

    const user = await getLocalUser(userId);
    if (!user) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }
    const rows = isStaff(user.role as UserRole) ?
      (await db.select().from(orders).orderBy(desc(orders.createdAt))) :
      (await db.select().from(orders).where(eq(orders.userId, user.id)));
    if (rows.length === 0) {
        res.status(200).json({
        orders: [],
       });
}
    const ids = rows.map((r) => r.id);
    const previewByOrder = new Map();


    if (ids.length > 0) {
      const allTheStuff = await
        db.select(
          {
            orderId: orderItems.orderId,
            quantity: orderItems.quantity,
            name: products.name,
            slug: products.slug,
            imageurl: products.imageurl,
          }
        ).from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(inArray(orderItems.orderId, ids))
          .orderBy(asc(orderItems.id));

      for (const row of allTheStuff) {
        const list = previewByOrder.get(row.orderId) ?? [];
        list.push({
          name: row.name,
          slug: row.slug,
          imageUrl: row.imageurl,
          quantity: row.quantity,
        });
        previewByOrder.set(row.orderId, list);
      }
      const ordersPayload = rows.map((o) => ({
        ...o,
        previewItems: previewByOrder.get(o.id) ?? [],
      }));


      res.json({ orders: ordersPayload });
    } else {
      res.json({
        orders: [],
      });
    }

  } catch (e) {
    next(e);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const canAccess = order.userId === localUser.id || isStaff(localUser.role);
    if (!canAccess) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPrice: orderItems.price,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    res.json({ order, items });
  } catch (e) {
    next(e);
  }
}


export async function createStreamChannel(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const server = getStreamChatServer(env);

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);

    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const isOwner = order.userId === localUser.id;
    if (!isOwner && !isStaff(localUser.role)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const ordersasid = order.polerOrderId;
    const [ordersas] = await db.select({ status: checkoutSessions.status }).from(checkoutSessions).where(eq(checkoutSessions.polerCheckoutId, ordersasid));
    if (ordersas.status !== "paid") {
      res.status(403).json({ error: "Order must be paid to open support chat" });
      return;
    }

    const streamChatUserId = streamuserid(userId);

    await server.upsertUser({
      id: streamChatUserId,
      name: StreamChatDisplayName(localUser.role, localUser.name, localUser.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging", channelId, {
      name: `Support · order ${order.id.slice(0, 8)}`,
      created_by_id: streamChatUserId,
    });

    await channel.create();

    await channel.addMembers([streamChatUserId]);

    res.json({ channelType: "messaging", channelId, streamUserId: streamChatUserId });
  } catch (e) {
    next(e);
  }
}

export async function createVideoInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const server = getStreamChatServer(env);

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    if (!isStaff(localUser.role)) {
      res.status(403).json({ error: "Only support or admin can send a video invite" });
      return;
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);
    const ordersasid = order.polerOrderId;
    const [ordersas] = await db.select({ status: checkoutSessions.status }).from(checkoutSessions).where(eq(checkoutSessions.polerCheckoutId, ordersasid));
    if (!ordersas || ordersas.status !== "paid") {
      res.status(404).json({ error: "Order not found or not paid" });
      return;
    }

    const [owner] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);

    const customerSid = streamuserid(owner.userClerkId);
    await server.upsertUser({
      id: customerSid,
      name: owner.name ?? owner.email ?? "Customer",
    });

    const staffStreamUserId = streamuserid(userId);
    await server.upsertUser({
      id: staffStreamUserId,
      name: StreamChatDisplayName(localUser.role, localUser.name, localUser.email),
    });

    const channelId = `order-${order.id}`;
    const channel = server.channel("messaging", channelId, {
      name: `Support · order ${order.id.slice(0, 8)}`,
      created_by_id: customerSid,
    });

    await channel.create();
    await channel.addMembers([customerSid, staffStreamUserId]);

    const joinUrl = `${env.FRONTEND_URL.replace(/\/+$/, "")}/orders/${order.id}/call`;

    await channel.sendMessage({
      text: `Video call — tap Join below (same link for everyone): ${joinUrl}`,
      user_id: staffStreamUserId,
      custom: {
        video_invite: true,
        join_url: joinUrl,
      },
    });

    res.json({ ok: true, joinUrl });
  } catch (e) {
    next(e);
  }
}