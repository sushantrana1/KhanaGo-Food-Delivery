export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL,
  themealdbUrl: process.env.THEMEALDB_API_URL || "https://www.themealdb.com/api/json/v1/1",
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY,
    publicKey: process.env.KHALTI_PUBLIC_KEY,
  },
  esewa: {
    merchantId: process.env.ESEWA_MERCHANT_ID,
    secretKey: process.env.ESEWA_SECRET_KEY,
  },
  imepay: {
    merchantCode: process.env.IMEPAY_MERCHANT_CODE,
    secretKey: process.env.IMEPAY_SECRET_KEY,
  },
};
