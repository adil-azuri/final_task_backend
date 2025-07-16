import express from "express";
import { register, login, updateProfile } from "../controllers/account-controller";
import { uploads } from "../utility/multer";
import { authenticate } from '../middlewares/authenticate';


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/update-profile", authenticate, uploads.single('profile'), updateProfile);


export default router;