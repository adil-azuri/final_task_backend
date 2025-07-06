import express from "express";
import { addProduct, deleteProduct, getProduct, updatePhotoProduct, updateProduct } from "../controllers/product-controller";
import { authenticate } from '../middlewares/authenticate';
import { uploads } from "../utility/multer";

const router = express.Router();

router.post('/add', authenticate, addProduct)
router.put('/update/:id', authenticate, updateProduct)
router.delete('/delete/:id', authenticate, deleteProduct)
router.get('/get', authenticate, getProduct)
router.put('/update-photo/:id', authenticate, uploads.single('photo'), updatePhotoProduct)

export default router;