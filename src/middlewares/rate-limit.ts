import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 100,//max 5 req per menit
    message: "Terlalu banyak Request, Silahkan mencoba beberapa saat lagi"
})

export default limiter