import { clerkFrontendApiProxy } from '@clerk/backend/proxy';
import { NODE_VERSION } from '@sentry/node';
import {z} from 'zod';
import 'dotenv/config';
//using  Zod for typescript  validation as it made for
 
const envSchema=z.object({
    NODE_ENV:z.enum(['development','production','test']),

    //if it is string then it convert into number if it is number then it will be used as it is
    PORT:z.coerce.number().default(3000),
    DATABASE_URL:z.string().min(1),


    CLERK_PUBLISHABLE_KEY:z.string().min(1),
    CLERK_SECRET_KEY:z.string().min(1),
    CLERK_WEBHOOK_SECRET:z.string(),


    FRONTEND_URL:z.string().min(1),

    POLER_ACCESS_TOKEN:z.string(),
    POLER_WEBHOOK_SECRET:z.string(),
    POLER_API_BASE_URL:z.string().url().default("https://api.polar.sh"),
    POLER_CHECKOUT_ID:z.string().uuid(),

    STREAM_API_KEY:z.string().min(1),
    STREAM_API_SECRET:z.string().min(1),

    IMAGE_KIT_PUBLIC_KEY:z.string().min(1),
    IMAGE_KIT_PRIVATE_KEY:z.string().min(1),
    IMAGE_KIT_URL_ENDPOINT:z.string().url(),
     
    SENTRY_DSN:z.string().url().optional(),
})
 

export type Env = z.infer<typeof envSchema>;

export  function loadEnv(){
  const parsed = envSchema.safeParse(process.env);
 // console.log(parsed);
    if(!parsed.success){
        console.error(" Invalid environment variables:", parsed.error.format());
        throw new Error("Invalid environment variables");
    }
    return parsed.data;
}


let chachedEnv: Env | null = null;


//for performance we are caching the env variables so that we don't have to parse them every time we need to access them
export function getEnv(){
    if(!chachedEnv){
        chachedEnv=loadEnv();
    }
     return chachedEnv;
}