module.exports = {
    dev: {
    "default-src": ["'self'"],
    "style-src": [
      "'self'",
      "https://*.google.com",
      "https://*.razorpay.com"
    ]
    },
    prod: {
    "default-src": "'self'",  // can be either a string or an array.
    "style-src": [
      "'self'",
      "https://*.facebook.com",
      "'unsafe-inline'"
    ],
    "script-src":[
        "'self'",
      "https://*.google.com",
      "https://*.razorpay.com",
      "'unsafe-inline'"
    ],
    "connect-src": [
      "'self'",
      "https://*.razorpay.com",
      "'unsafe-inline'"
    ],
    "img-src":[
        "'self'",
        "https://*.google.com",
        "https://*.razorpay.com",
        "'unsafe-inline'"
    ]
    }
  }