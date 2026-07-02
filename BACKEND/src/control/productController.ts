import { and, desc, eq} from "drizzle-orm";
import { db } from "../database/index.js";
import { products } from "../database/schema.js";
import { Request,Response ,NextFunction} from "express";

export async function listProduct(req:Request , res:Response , next:NextFunction){
    try {
        const catogory=(typeof req.query.category) === "string"? (req.query.category) : "";
        const catogorystr=String(catogory||"");
        const activeOnly= eq(products.active,true);
        const WhereCluase=catogory != ""? and(activeOnly,eq(products.category,catogorystr)):activeOnly;
        const row=await db.select().from(products).where(WhereCluase).orderBy(desc(products.createdAt));
         res.json({product:row});
    } catch (e) {
        next(e);
    }
    
}

export async function productCatogory(req:Request , res:Response , next:NextFunction){
    try {
        //selecting catogory tuple from the products table wher product is active
         const row = await db.select({category:products.category}).from(products).where(eq(products.active,true));
        // extracting ffrom row and convert it into row and the sort alphabathically
         const category=[...new Set(row.map((r)=>(r.category)))].sort((a,b)=>a.localeCompare(b));
         res.json({catog:category});
    } catch (e) {
        next(e);
    }
    
}
export async function productBySlug(req:Request , res:Response , next:NextFunction){
    try {
        const row=await db.select().from(products).where(and(eq(products.slug , req.params.slug as string),eq(products.active,true)));
        if(!row) res.json({error:"Not Found "});
         res.json({product:row});
    } catch (e) {
        next(e);
    }
    
}