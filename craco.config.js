module.exports = {
    devServer: {
        port: 2543,
        headers: {
            'X-Frame-Options': 'http://portal.dev.dhdp.ca',
            'Content-Security-Policy': 'http://portal.dev.dhdp.ca'
        }
    }
};
