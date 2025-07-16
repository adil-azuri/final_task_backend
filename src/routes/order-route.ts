import express from "express";
import { addOrder, deleteOrder, getAllOrder, getUserOrder, transferPoint, updateOrder } from "../controllers/order-controller";
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.post('/create', authenticate, addOrder)
router.put('/update/:id', authenticate, updateOrder)
router.delete('/delete/:id', authenticate, deleteOrder)
router.get('/get', authenticate, getAllOrder)
router.get('/get-user', authenticate, getUserOrder)

router.post('/transfer', authenticate, transferPoint)

export default router;