import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebHookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';
import fs from "node:fs";
import path from "node:path";
import meRoute from './routers/meRouter.js'
import productRoute from './routers/productRouter.js'
import streamRoute from './routers/streamRouter.js'

const env = getEnv();
const app = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/Clerk/Webhook", rawJson, (req, res) => {
   clerkWebHookHandler(req, res);
})

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/me',meRoute);
app.use('/api/product',productRoute);
app.use('/api/stream',streamRoute);


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


app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
