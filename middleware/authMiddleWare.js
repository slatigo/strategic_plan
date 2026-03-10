const jwt = require('jsonwebtoken');

/**
 * Protect: Verifies the JWT and attaches user to req.user
 */
exports.protect = (req, res, next) => {
    const token = req.cookies.npa_token;
    
    // 1. Check if token exists
    if (!token) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ status: 'fail', message: 'Session expired. Please login.' });
        }
        return res.redirect('/login');
    }
    
    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach user to request
        req.user = decoded; 
        
        // 4. Global variable for Pug templates (no need to pass user: req.user anymore)
        res.locals.user = decoded;
        
        next();
    } catch (err) {
        res.clearCookie('npa_token');
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ status: 'fail', message: 'Invalid session.' });
        }
        return res.redirect('/login');
    }
};

/**
 * restrictTo: Unified Authorization for Views and APIs
 * Usage: restrictTo('System Admin') or restrictTo('MDA Admin', 'System Admin')
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
       
        // 1. Safety check: If protect didn't run or user is missing
        if (!req.user || !roles.includes(req.user.role)) {
           
            // 2. Check if it's an API call (return JSON)
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
                return res.status(403).json({ 
                    status: 'fail', 
                    message: 'Access Denied: Insufficient Permissions' 
                });
            }
            
            // 3. Page request: Try-catch the render to prevent 500 errors
            try {

                return res.status(403).render('error', { 
                    title: 'Access Denied',
                    message: 'You do not have permission to view this page.' 
                });
            } catch (err) {
                // Fallback if the .pug file is missing/broken
                return res.status(403).send('Access Denied (Error template missing)');
            }
        }
        next();
    };
};