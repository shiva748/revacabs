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
    ],
    "script-src":[
        "'self'",
      "https://*.google.com",
      "https://*.razorpay.com"
    ],
    "connect-src": [
      "'self'",
      "https://*.razorpay.com"
    ]
    }
  }