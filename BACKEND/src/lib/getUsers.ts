import { users } from "../database/schema.js";
import { db } from "../database/index.js";
import { eq } from "drizzle-orm";

export async function getLocalUser(ClerkUserId:string){
    const [row]=await db.select().from(users).where(eq(users.userClerkId,ClerkUserId)).limit(1);
    return row;
}