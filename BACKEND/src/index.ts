import express, { NextFunction ,Request,Response} from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebHookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';
import fs from "node:fs";
import path from "node:path";
import meRoute from './routers/meRouter.js';
import productRoute from './routers/productRouter.js';
import AdminRoute from './routers/AdminRouter.js';
import streamRoute from './routers/streamRouter.js';
import checkOutRoute from './routers/checkOutRouter.js';
import OrderRoute from './routers/OrderRouter.js';
import { PolerWebHookHandler } from './webhooks/polar.js';
import {ClerkSentryMiddleWare} from './middleware/SentryClerkUser.js'
import * as Sentry from "@sentry/node";

const env = getEnv();
const app = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/Clerk/Webhook", rawJson, (req, res) => {
   clerkWebHookHandler(req, res);
})
app.post("/Polar/Webhook", rawJson, (req, res) => {
   PolerWebHookHandler(req, res);
})

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(ClerkSentryMiddleWare);


app.use('/api/me',meRoute);
app.use('/api/product',productRoute);
app.use('/api/stream',streamRoute);
app.use('/api/checkOut',checkOutRoute);
app.use('/api/adminRoute',AdminRoute);
app.use('/api/orderRoute',OrderRoute);


const publicDir = path.join(process.cwd(),"..", "FRONTEND", "dist");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
      next();
      return;
    }

    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

Sentry.setupExpressErrorHandler(app);
app.use((e:unknown,req:express.Request,res:express.Response,next:express.NextFunction)=>{
  const sentryId=(res as express.Response & {sentry?:string}).sentry;
  res.status(500).json({
    error:"Internal Server Error",
    err: e,
    ...(sentryId!==undefined && {sentryId}),
  });

});
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
