import { RequestHandler } from "express";
import * as Sentry from "@sentry/node";
import { getAuth } from "@clerk/express";
export const  ClerkSentryMiddleWare:RequestHandler=(req,res,next)=>{
    const {userId}=getAuth(req);
    Sentry.getIsolationScope().setUser(userId?{id:userId}:null);
    next();
}