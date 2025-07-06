import express from "express";
import account_router from "./routes/account-route";
import product_router from "./routes/product-route";
import order_router from "./routes/order-route";
import { errorHandler } from "./middlewares/error-handler";
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(errorHandler);

app.use("/marketplace", account_router);

app.use("/product", product_router);

app.use("/order", order_router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}✅`);
});