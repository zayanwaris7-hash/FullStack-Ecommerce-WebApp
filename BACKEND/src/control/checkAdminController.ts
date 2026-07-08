import type { Request, Response, NextFunction } from "express"
import { getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/getUsers.js";
import { isAdmin } from "../lib/roles.js";
import ImageKit from "@imagekit/nodejs";
import "dotenv/config";
import { getEnv } from "../lib/env.js";
import { db } from "../database/index.js";
import { products,orderItems } from "../database/schema.js";
import { desc } from "drizzle-orm";
import { string, z } from "zod";
import { eq ,count} from "drizzle-orm";
import {delteImgkitId} from "../lib/imagekit.js";
/*id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(""),
  price: integer('price').notNull(),
  imageurl: text('image_url').notNull().default(""),
  imageKitFileId: text('image_kit_file_id').notNull().default(""),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),    
  active: boolean('active').default(true).notNull(),
 */
const env = getEnv();
const productSchema = z.object({
    slug: z.string().min(2),
    name: z.string().min(2),
    category: z.string().min(2).default("General"),
    description: z.string().default(""),
    price: z.number().int().positive(),
    imageurl: z
        .union([z.string().url(), z.literal("")])
        .optional()
        .nullable(),
    imageKitFileId: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
    active: z.boolean().default(true),
});
const patchedProduct = productSchema.partial();

function buildProductUpdateSet(body: z.infer<typeof patchedProduct>) {
    const data: Partial<typeof products.$inferInsert> = {};
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.name !== undefined) data.name = body.name;
    if (body.category !== undefined) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;
    if (body.price !== undefined) data.price = body.price;
    if (body.imageurl !== undefined) data.imageurl = body.imageurl === "" ? null : body.imageurl;
    if (body.imageKitFileId !== undefined) {
        data.imageKitFileId = body.imageKitFileId === "" ? null : body.imageKitFileId;
    }
    if (body.active !== undefined) data.active = body.active;
    return data;
}

async function isProductwithThisIdExist(id: string) {
    const result = await db.select().from(products).where(eq(products.id, id));
    if (!result) return false;
    else return true;
}

export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, isAuthenticated } = getAuth(req);
        if (!isAuthenticated || !userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const localUserr = getLocalUser(userId);

        if (!isAdmin((await localUserr).role)) {
            res.status(403).json({ error: "Only Admin Access this!" });
        }

        next();
    } catch (e) {
        next(e);
    }
}

export function getImageKitAuth(req: Request, res: Response, next: NextFunction) {
    try {
        //its create an instance to imagekit server
        const client = new ImageKit({
            privateKey: env.IMAGE_KIT_PRIVATE_KEY,
        });
        const Auth = client.helper.getAuthenticationParameters();
        //this will return object having token,expire,signature
        res.json(
            {
                ...Auth,
                publicKey: env.IMAGE_KIT_PUBLIC_KEY,
                url: env.IMAGE_KIT_URL_ENDPOINT
            }
        )

    } catch (e) {
        next(e);
    }
}

export async function listAdminProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const rows = await db.select().from(products).orderBy(desc(products.createdAt))
        res.json({ product: rows });
    } catch (e) {
        next(e);
    }
}


export async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const obj = productSchema.safeParse(req.body);
        if (!obj.success) {
            res.status(400).json({ error: obj.error });
            return;
        }
        const { imageurl, imageKitFileId, ...rest } = obj.data;
        const [row] = await db.insert(products).values({
            ...rest,
            imageurl: imageurl || null,
            imageKitFileId: imageKitFileId || null
        }).returning();

        res.status(201).json({ product: row });
    } catch (e) {
        next(e);
    }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const Parsed = patchedProduct.safeParse(req.body);
        if (!Parsed.success) {
            res.status(400).json({ error: Parsed.error });
            return;
        }
        const productToUpdate = buildProductUpdateSet(Parsed.data);
        if (Object.keys(buildProductUpdateSet).length === 0) {
            res.status(400).json({ error: "Nothing to updated" });
            return;
        }

        const added = await db.update(products).set(productToUpdate).where(eq(products.id, req.params.id as string)).returning();
        if (!added) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        res.json({ product: added });
    } catch (e) {
        next(e);
    }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const exsist = isProductwithThisIdExist(req.params.id as string);

        if (!exsist) {
            res.status(402).json({ error: "No Product with id u send found" });
            return;
        }

        const [countRow] = await db
            .select({ c: count() })
            .from(orderItems)
            .where(eq(orderItems.productId, req.params.id as string));

        if (Number(countRow?.c ?? 0) > 0) {
            res.status(409).json({
                error:
                    "This product is on one or more orders and cannot be deleted. Deactivate it instead.",
            });
            return;
        }
        delteImgkitId(env,req.params.id as string);
        await db.delete(products).where(eq(products.id,req.params.id as string));
        res.status(201).send({ deletedProductId: req.params.id })
    } catch (e) {
         next(e);
    }
}