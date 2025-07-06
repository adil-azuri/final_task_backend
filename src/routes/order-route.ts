import express from "express";
import { addOrder, deleteOrder, getAllOrder, getUserOrder, updateOrder } from "../controllers/order-controller";
import { authenticate } from '../middlewares/authenticate';

const router = express.Router();

router.post('/add', authenticate, addOrder)
router.put('/update/:id', authenticate, updateOrder)
router.delete('/delete/:id', authenticate, deleteOrder)
router.get('/get', authenticate, getAllOrder)
router.get('/get-user', authenticate, getUserOrder)

export default router;