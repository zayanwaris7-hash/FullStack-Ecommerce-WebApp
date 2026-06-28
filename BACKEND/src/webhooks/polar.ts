import express from 'express';
import { checkoutSessions, orderItems, orders } from '../database/schema.js';
import { getEnv } from '../lib/env.js';
import { db } from '../database/index.js';
import { eq } from 'drizzle-orm';
import { Webhook } from 'standardwebhooks';
function headerString(headers: express.Request["headers"], name: string) {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
}
async function alreadyPaid(sessionId: string) {
    const [row] = await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, sessionId));
    if (row?.status === "paid") return true;
    return false;
}
async function searchOtherFromSessionId(sessId: string) {
    const [row] = await db.select().from(checkoutSessions).where(eq(checkoutSessions.id, sessId));
    return row;
}
function checkoutSessionIdFromMetaData(data: Record<string, unknown>) {
    const metaData = data.metadata;
    if (!metaData || typeof metaData !== "object") return undefined;
    const sessionId = (metaData as Record<string, unknown>).checkout_session_id;
    return typeof sessionId === "string" ? sessionId : undefined;
}
type CheckoutSession = typeof checkoutSessions.$inferSelect;
async function fullfillCheckOutSession(
    sessionId: string,
    orderId: string,
    all: CheckoutSession
) {
    return await db.transaction(async (tx) => {
        await tx
            .update(checkoutSessions)
            .set({ status: "paid" })
            .where(eq(checkoutSessions.id, sessionId));

        if (!all.polerCheckoutId) {
            throw new Error("Polar checkout id is missing");
        }

        await tx.insert(orders).values({
            userId: all.userId,
            status: "processing",
            polerCheckoutId: all.polerCheckoutId,
            polerOrderId: orderId,
            totalprice: all.totalprice,
        });

        return true;
    });
}
export async function PolerWebHookHandler(req: express.Request, res: express.Response) {
    const env = getEnv();
    try {
        if (!env.POLER_WEBHOOK_SECRET) {
            res.status(503).send("Polar webhook Not Configured");
            return;
        }
        const raw = req.body instanceof Buffer ? req.body : Buffer.from(String(req.body));
        const wh = new Webhook(Buffer.from(env.POLER_WEBHOOK_SECRET, 'utf8').toString("base64"));
        const id = headerString(req.headers, "webhook-id");
        const ts = headerString(req.headers, "webhook-timestamp");
        const sig = headerString(req.headers, "webhook-signature");
        if (!id || !ts || !sig) {
            res.status(400).send("Polar webhook header missing");
            return;
        }
        wh.verify(raw, {
            "webhook-id": id,
            "webhook-timestamp": ts,
            "webhook-signature": sig,
        });

        const event = JSON.parse(raw.toString('utf8')) as {
            type: string;
            data?: Record<string, unknown>;
        }

        if (event.type === "order.paid" && event.data) {
            const data = event.data;
            const orderId = typeof data.id === "string" ? data.id : undefined;
            const sessionId = checkoutSessionIdFromMetaData(data);
            if (sessionId === undefined || !orderId) {
                throw new Error("session and id Id not found")
            }
            const all = await searchOtherFromSessionId(sessionId);
            if (!all) {
                res.status(404).send("Matching checkout session not found");
                return;
            }
            if (await alreadyPaid(sessionId)) {
                res.status(200).json({ ok: true, duplicate: true });
                return;
            }


            await fullfillCheckOutSession(sessionId, orderId, all);

            res.status(200).json({ ok: true });
        }
    } catch (e) {

        console.error(e);
        res.status(400).send("Invalid webhook");
    }
}