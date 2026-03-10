require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./models');

// --- 1. Import Master Route Modules ---
const authRoutes = require('./routes/authRoutes'); // Combined View + API
const npaRoutes = require('./routes/npaRoutes');   // Specialized NPA Module
const mdaRoutes = require('./routes/mdaRoutes')
const app = express();

// --- 2. View Engine & Static Files ---
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. Global Middleware ---
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. Route Mounting ---

// Auth Module (Handles /login and /api/login)
// Since you chose Option B, this covers both the Pug page and the Logic
app.use('/', authRoutes); 

// NPA Admin Module (Prefixes all routes with /npa)
// Access via: /npa/dashboard, /npa/api/plan-calls, etc.
app.use('/npa', npaRoutes); 
app.use('/mda', mdaRoutes); // Handles all /mda/* paths
// --- 5. 404 Handler ---
app.use((req, res, next) => {
    const err = new Error('Resource Not Found');
    err.status = 404;
    next(err);
});

// --- 6. Global Error Handler ---
app.use((err, req, res, next) => {
    const status = err.status || 500;
    
    // Check if the request was for an API endpoint
    if (req.originalUrl.includes('/api/')) {
        return res.status(status).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }

    // Otherwise, render a user-friendly error page
    res.status(status).render('error', { 
        message: err.message || "Something went wrong on our end.",
        status: status
    });
});

const PORT = process.env.PORT || 3002;

db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connected');
        // Start listening ONLY after DB is ready
        app.listen(PORT, () => {
            console.log(`🚀 Portal: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ DB Connection Failed:', err.message);
    });