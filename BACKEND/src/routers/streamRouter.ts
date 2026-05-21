import createStreamToken from '../control/StreamContoller.js';
import { Router } from "express";
// its become /api/stream/token
const route=Router();
route.get('/token',createStreamToken);
export default route;