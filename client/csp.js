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
    "default-src": [
        "'self'",
        "https://*.facebook.com",
        "https://*.razorpay.com",
        "unsafe-inline"
      ],  // can be either a string or an array.
    "style-src": [
      "'self'",
      "https://*.facebook.com",
      "https://*.razorpay.com",
      "unsafe-inline"
    ]
    }
  }