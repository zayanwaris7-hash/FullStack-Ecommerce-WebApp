import { Router } from "express";
import {createCheckOut} from "../control/createCheckOutController.js"
const router=Router();
router.post("/",createCheckOut);
export default router;