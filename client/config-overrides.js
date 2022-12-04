const {override} = require('customize-cra');
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const cspConfigPolicy = {
    'default-src': 'self',
"script-src": ["'report-sample'", "'self'", "https://checkout.razorpay.com/v1/checkout.js"],
"style-src": ["'report-sample'", "'self'"],
"object-src": "'none'",
"base-uri": "'self'",
"connect-src": ["'self'", "https://lumberjack-metrics.razorpay.com", "https://lumberjack.razorpay.com", "https://rudderstack.razorpay.com"],
"font-src": 'self',
"frame-src": ["'self'", "https://api.razorpay.com"],
"img-src": "'self'",
"manifest-src": "'self'",
"media-src": "'self'",
"report-uri": ["https://638cc768de965af5189438f0.endpoint.csper.io/?v=1"],
"worker-src": "'none'",
};

function addCspHtmlWebpackPlugin(config) {
    if(process.env.NODE_ENV === 'production') {
        config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
    }

    return config;
}

module.exports = {
    webpack: override(addCspHtmlWebpackPlugin),
};