import express from "express";
import { addProduct, updateProduct, deleteProduct, getProduct, getProductDetail } from "../controllers/product-controller";
import { authenticate } from '../middlewares/authenticate';
import { uploads } from "../utility/multer";

const router = express.Router();

router.post('/add', authenticate, uploads.single('photo'), addProduct);
router.put('/update/:id', authenticate, uploads.single('photo'), updateProduct);
router.delete('/delete/:id', authenticate, deleteProduct);
router.get('/get', getProduct);
router.get("/get/:id", getProductDetail);

export default router;
