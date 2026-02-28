/**
 * API Auth Middleware to validate requests from external services.
 */
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (process.env.BACKEND_API_KEY && apiKey !== process.env.BACKEND_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

module.exports = { validateApiKey };
