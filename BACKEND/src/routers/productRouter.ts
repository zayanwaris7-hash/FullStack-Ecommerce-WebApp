import { Router } from "express";
import {listProduct,productBySlug,productCatogory} from '../control/productController.js';
const router=Router();

router.get('/',listProduct);
router.get('/catogory',productCatogory);
router.get('/:slug',productBySlug);

export default router;