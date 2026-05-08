import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware} from '@clerk/express';
import { clerkWebHookHandler } from './webhooks/clerk.js';
import { getEnv } from './lib/env.js';

const env = getEnv();
const app = express();
const rawJson=express.raw({type:"application/json",limit:"1mb"});

app.post("/Clerk/Webhook",rawJson,(req,res)=>{
    void clerkWebHookHandler(req,res);
})

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());



app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
