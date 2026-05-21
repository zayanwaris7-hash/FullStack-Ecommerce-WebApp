//impoert from schema file
import { db } from '../database/index.js';
//one lame debug (use env.POLER_WEBHOOK_SECRET instead of env.CLERK_WEBHOOK_SECRET)
import { users } from '../database/schema.js';
import { getEnv } from '../lib/env.js';
import { parseRole } from '../lib/roles.js';
import { UserJSON } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import express from 'express';
import { Webhook } from 'svix'
//this is web hook for clerk thing to connect with my neon db (user created /deleted/updaated in cler will also reflect into my bd)
export const clerkWebHookHandler = async (req: express.Request, res: express.Response) => {
    // Implementation for handling Clerk webhook events
    try {
        const env = getEnv();
        if (!env.CLERK_WEBHOOK_SECRET) {
            res.status(500).send("Clerk webHook is not configured!");
            return;
        }
        // Clerk verifier needs data in raw format .Express may send data in buffer or string form so we need  make it correct
        //check wheather the req.body is in buffer(raw binary) or not ,if it is then it coonver into human readable text form using UTF8,if it is not then it force that what ever it was just convert into string format .
        const payload = req.body instanceof Buffer ? req.body.toString('utf8') : String(req.body);

        const svix_id = req.headers["svix-id"] as string;
        const svix_timestamp = req.headers["svix-timestamp"] as string;
        const svix_signature = req.headers["svix-signature"] as string;

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ error: "Missing svix headers" });
        }

        const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
        let evt: any;
        try {
            evt = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error("Verification failed:", err);
            return res.status(400).json({ error: "Verification failed" });
        }

        const eventType = evt.type;
        console.log(`Webhook received with type: ${eventType}`);
        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            // Cast the data to UserJSON for better autocomplete
            const userData = evt.data as UserJSON;

            const clerkId = userData.id;
            const emaill = userData.email_addresses[0].email_address;
            const namee = [userData.first_name, userData.last_name].filter(Boolean).join(" ") ;
            const rolee = parseRole(userData.public_metadata?.role);

            await db.insert(users).values({
                userClerkId: clerkId,
                email: emaill,
                name: namee,
                role: rolee
            }).onConflictDoUpdate({//upsert command in 
                target: users.userClerkId,
                set: {
                    email: emaill,
                    name:namee,
                    role:rolee,
                    createdAt:new Date()
                }
            });

        }
        if(evt.type === 'user.deleted'){
            const id=evt.data.id;
            await db.delete(users).where(eq(users.userClerkId,id));
        }


      res.json({ok:true});

    } catch (err) {
     
        console.error("clerk web hook error ",err);
        res.status(400).json({err:"Invalid webhook"});

    }
};