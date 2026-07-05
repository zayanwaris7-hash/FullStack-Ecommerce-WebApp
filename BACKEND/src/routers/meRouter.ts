import { getLocalUser } from "../lib/getUsers.js";
import { getAuth } from "@clerk/express";
import { Router } from "express";

const router=Router();
// here req is coming with header and body insdie header their is field like Autheriztion having token clerk check if token is authenticates or not 
router.get('/',async (req ,res,next )=>{
    try {
        const {userId,isAuthenticated}=getAuth(req);
        if(!userId || !isAuthenticated){
         res.status(401).json({error:"Unauthorized"});
         return;
        }
        const id=await getLocalUser(userId);
        res.json(id);   
    } catch (e) {
        next(e);
    }
});

export default router;