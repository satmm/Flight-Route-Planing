const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/flightplan', // Adjust the path to match your API routes
        createProxyMiddleware({
            target: 'https://airbus-challenge.vercel.app',
            changeOrigin: true,
        })
    );
};
