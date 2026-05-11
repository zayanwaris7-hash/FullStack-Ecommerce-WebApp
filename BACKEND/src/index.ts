import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebHookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';
 import fs from "node:fs";
import path from "node:path";

const env = getEnv();
const app = express();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

app.post("/Clerk/Webhook", rawJson, (req, res) => {
    void clerkWebHookHandler(req, res);
})

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


const publicDir = path.join(process.cwd(), "public");
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
