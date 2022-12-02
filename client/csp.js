module.exports = {
    dev: {
    "default-src": [
      "'self'",
      "https://*.razorpay.com",
      "'unsafe-inline'"
    ],
    "script-src":[
      "'self'",
      "https://*.razorpay.com",
      "'unsafe-inline'"
    ]
    },
    prod: {
    "default-src": [
        "'self'",
        "https://*.facebook.com",
        "https://*.razorpay.com",
      ],  // can be either a string or an array.
    "style-src": [
      "'self'",
      "https://*.facebook.com",
      "https://*.razorpay.com",
      "unsafe-inline"
    ]
    }
  }