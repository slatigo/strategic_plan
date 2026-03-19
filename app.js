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
// Use the AppError class here for consistency
const AppError = require('./utils/appError'); 

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- 6. Global Error Handler ---
app.use((err, req, res, next) => {
    // 1. Set Defaults
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 2. Log error for the developer (in console)
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    }

    // 3. Handle API Requests (Fetch/AJAX)
    if (req.originalUrl.includes('/api/')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            // Only send stack trace in dev mode to help you debug
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }

    // 4. Handle Rendered Page Requests (Browser Navigation)
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        status: err.statusCode,
        message: err.message || "Something went wrong on our end."
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