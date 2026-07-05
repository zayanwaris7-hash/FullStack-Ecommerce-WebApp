import { Request,Response,NextFunction } from "express";
import { getEnv } from "../lib/env.js";
import { clerkClient, getAuth } from "@clerk/express";
import { getLocalUser } from "../lib/getUsers.js";
import { StreamChatDisplayName,getStreamChatServer,streamuserid } from "../lib/stream.js";
import { boolean } from "drizzle-orm/pg-core";


const env=getEnv();

async function createStreamToken(req:Request,res:Response,next:NextFunction){
 
    try {
        const {userId,isAuthenticated}=getAuth(req);
        if(!userId || !isAuthenticated){
         res.status(401).json({error:"Unauthorized"});
         return;
        }
        const LocalUser=await getLocalUser(userId);
        if(!LocalUser){
            res.status(503).json({error:"Acc not synced yet"});
            return;
        }


        const server=getStreamChatServer(env);
        const clerkUserId= await clerkClient.users.getUser(userId);
        //.filter(boolean check if user has last name or not if its then filter it)
        const combined = [clerkUserId.firstName,clerkUserId.lastName].filter(Boolean).join(" ")||null;
        const displayName=StreamChatDisplayName(LocalUser.role,LocalUser.name??combined??clerkUserId.fullName,LocalUser.email);
        const img=clerkUserId.imageUrl || null;
        const sid=streamuserid(userId);
        const done =await server.upsertUser({id:sid,name:displayName,image:img});
        if(!done){
            console.error("not server upsert line 34 (/control/streamcontollor.ts)");
        }
        const token=server.createToken(sid);
        res.json({
            token,
            apikey:env.STREAM_API_KEY,
            userId:sid,
            name:displayName
        });

    } catch (e) {

        next(e);
    }
}
export default createStreamToken;