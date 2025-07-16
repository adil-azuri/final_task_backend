import express from "express";
import account_router from "./routes/account-route";
import product_router from "./routes/product-route";
import order_router from "./routes/order-route";
import { errorHandler } from "./middlewares/error-handler"; // Tetap import
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

const app = express();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'src/uploads')));

app.use("/marketplace", account_router);
app.use("/product", product_router);
app.use("/orders", order_router);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}✅`);
});