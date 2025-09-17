import rateLimit from 'express-rate-limit';

// Set up rate limiting for a specific route
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        // success: false,
        // message: "Too many requests, please try again later.",
            status:500,
            message:'Too many requests. Please try again later.',
            data:null
      },  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const couponLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        // success: false,
        // message: "Too many requests, please try again later.",
            status:500,
            message:'Too many requests. Please try again later.',
            data:null
      },  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
   handler: function (req, res, next) {
  res.status(400).json({
    status: 0,
    message: 'You have reached the request limit. Please try again later.',
  });
},
 standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
     handler: function (req, res, next) {
    res.status(400).json({
      status: 0,
      message: 'You have reached the request limit. Please try again later.',
    });
  },
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});