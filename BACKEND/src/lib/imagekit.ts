import { db } from "../database/index.js";
import { Env } from "./env.js";
import { products } from "../database/schema.js";
import { eq } from "drizzle-orm";
import ImageKit, { NotFoundError } from "@imagekit/nodejs";


async function getImgKitId(id:string){
    const [fileId]=await db.select({imageKitFileId:products.imageKitFileId}).from(products).where(eq(products.id,id));
    return fileId.imageKitFileId??null;
}

export async function delteImgkitId(env:Env,id:string){
   const fileId=await getImgKitId(id);
   if(!fileId) return;
  const client = new ImageKit({ privateKey: env.IMAGE_KIT_PRIVATE_KEY });
  try {
    await client.files.delete(fileId);
  } catch (e: unknown) {
    if (e instanceof NotFoundError) return;
    throw e;
  }
}