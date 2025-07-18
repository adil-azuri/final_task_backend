import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: "src/uploads",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

export const uploads = multer({
    storage,
})