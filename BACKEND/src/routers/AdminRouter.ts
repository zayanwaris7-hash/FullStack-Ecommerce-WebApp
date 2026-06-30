import { Router } from "express";
import {checkAdmin,getImageKitAuth,listAdminProduct,createProduct,updateProduct,deleteProduct} from "../control/checkAdminController.js";
const router=Router();
///    api/adminRoute
router.use(checkAdmin);
router.get("/imageKit/auth",getImageKitAuth);
router.get("/product",listAdminProduct);
router.post("/product",createProduct);
router.patch("/product/:id",updateProduct);
router.delete("/product/:id",deleteProduct);
export default router;