import { z } from "zod";
import { getEnv } from "../lib/env.js";
import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../database/index.js";
import { checkoutSessionLine, checkoutSessions, products } from "../database/schema.js";
import { and, inArray, eq } from "drizzle-orm";
import { getLocalUser } from "../lib/getUsers.js";
import { polarCreateCheckOut } from "../lib/poler.js";

const env = getEnv();
const cartSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
    })).min(1),
});


export async function createCheckOut(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req);
        if (!userId || !isAuthenticated) {
            res.status(404).json({ error: "Unauthorized" });
            return;
        }

        const parsed = cartSchema.safeParse(req.body);
        if (!parsed.success) {
            res.send(404).json({ error: "Invalid Cart", description: parsed.error });
            return;
        }

        if (!env.POLER_ACCESS_TOKEN) {
            res.send(503).json({ error: "Checkouts not configured" });
            return;
        }
        const localUser = await getLocalUser(userId);
        if (!localUser) {
            res.send(404).json({ error: "Not Signed In !" });
            return;
        }
        const ids = parsed.data.items.map(product => product.productId);

        const productRows = await db.select().from(products).where(and(inArray(products.id, ids), eq(products.active, true)));
        if (productRows.length !== ids.length) {
            res.status(400).json({ error: "One or more product is inavalid " });
            return;
        }

        const byId = new Map(productRows.map((p) => [p.id, p]));
        let totalCent = 0;
        const lines: checkoutSessionLine[] = [];
        for (const line of parsed.data.items) {
            const p = byId.get(line.productId);
            let price = p?.price ?? 0;
            totalCent += price * line.quantity;
            lines.push({
                productId: line.productId,
                quantity: line.quantity,
                price: price,
            });
        }
        if(totalCent<10){
            res.status(400).json({ error: "Total Price Below Polar Minimum" });
            return;
        }

        const [session]=await db.insert(checkoutSessions).values({
            userId:localUser.id,
            totalprice:totalCent,
            currency:"pkr",
            lines,
        }).returning();

        const returnUrl=`${env.FRONTEND_URL}/cart`;
        const successUrl=`${env.FRONTEND_URL}/checkout/return?checkoout_id={CHECKOUT_ID}`;
        const checkout=await polarCreateCheckOut(env,{
            products:[env.POLER_CHECKOUT_ID],
            prices:{
                [env.POLER_CHECKOUT_ID]:[{
                    amount_type:"fixed",
                    price_amount:totalCent,
                    price_currency:"pkr"
                }]
            },
            success_url:successUrl,
            return_url:returnUrl,
            metadata:{checkout_session_id:session.id}
        });
        await db.update(checkoutSessions).set({polerCheckoutId:checkout.id}).where(eq(checkoutSessions.id,session.id));
        res.json({checkOutUrl:checkout.url})
    } catch (e) {
        next(e);
    }
}