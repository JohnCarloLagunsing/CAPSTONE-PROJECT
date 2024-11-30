const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const dotenv = require('dotenv');
const pool = require('./public/scripts/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Unified Middleware configuration for CORS
app.use(cors({
    origin: ['https://ecentersanluis.com', 'https://www.ecentersanluis.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
}));

// Remove redundant preflight request handler
// Remove the custom CORS header middleware

// Parse request bodies and cookies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Unified session configuration
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'permit_session', // Use this table for all session data
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
        httpOnly: true,
    },
}));

// Debugging middleware for session logging
app.use((req, res, next) => {
    console.log("Session data on request:", req.session);
    next();
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import route files
const loginProcessRouter = require('./server/loginFunc');
const Analysis = require('./server/Analysis');
const Occuprocess = require('./server/Occuprocess');
const Verifying = require('./server/Verifying');
const FranchiseProcess = require('./server/FranchiseProcess');
const HeadAdmin = require('./server/HeadadminLogin');
const HeadAdminaccount = require('./server/HeadAdminaccount');
const PasswordReset = require('./server/PasswordReset');
const AdminChangePass = require('./server/AdminChangPass');
const InspectorSignup = require('./server/InspectorSignup');
const inspectorchangepass = require('./server/inspectorchangepass');
const inspectorchangepass2 = require('./server/inspectorchangepass2');
const Signup = require('./server/SignupProcess');
const Occupational = require('./server/occupational');
const OccupationalApplicants = require('./server/OccupationalApplicants');
const Occuformhandler = require('./server/Occuformhandler');
const Occustatus = require('./server/Occustatus');
const SubmissionOccu = require('./server/SubmissionOccu');
const MtopForm = require('./server/MtopForm');
const Occupayment = require('./server/Occupayment');
const SearchingApplicant = require('./server/SearchingApplicant.js'); // Correct capitalization
const MTOPpayment = require('./server/MTOPpayment');
const VerifyingMTOP = require('./server/VerifyingMTOP.js');
const Occuverify = require('./server/Occuverify.js');
const verifymtop = require('./server/MTopapplication.js');
const applicantchangepass = require('./server/applicantchangepass.js');

// Define routes
app.use('/', loginProcessRouter);
app.use('/data', Analysis);
app.use('/', Occuprocess);
app.use('/', Verifying);
app.use('/', FranchiseProcess);
app.use('/', HeadAdmin);
app.use('/', HeadAdminaccount);
app.use('/', PasswordReset);
app.use('/', AdminChangePass);
app.use('/', InspectorSignup);
app.use('/', inspectorchangepass);
app.use('/', inspectorchangepass2);
app.use('/', Signup);
app.use('/signup', Occupational);
app.use('/auth', OccupationalApplicants);
app.use('/submit', Occuformhandler);
app.use('/status', Occustatus);
app.use('/', SubmissionOccu);
app.use('/', MtopForm);
app.use('/payment', Occupayment);
app.use('/applicant', SearchingApplicant);
app.use('/payment', MTOPpayment);
app.use('/api', VerifyingMTOP);
app.use('/', Occuverify);
app.use('/', verifymtop);
app.use('/', applicantchangepass);

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user_id) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// Protect specific routes
const protectedRoutes = [
    '/AdminOccuForm',
    '/applicantdashboard',
    '/dashboard',
    '/forgotpassAdmin',
    '/forgotpassAdmin2',
    '/FranchiseForm',
    '/HeadAdmin',
    '/HeadDashboard',
    '/inspectorchangepass',
    '/inspectorchangepass2',
    '/login',
    '/MtopForm',
    '/occupational',
    '/occustatus',
    '/PayForMTOP',
    '/payment',
    '/PayOccuPermit',
    '/signup',
    '/SignupforInspector',
    '/VerifyingDocuments',
    '/applicant'
];

protectedRoutes.forEach((route) => {
    app.get(route, isAuthenticated, (req, res) => {
        const filePath = path.join(__dirname, 'public', `${route.substring(1)}.html`);
        console.log('Serving file:', filePath);
        res.sendFile(filePath);
    });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'applicant.html'));
});

// Test session route
app.get('/test-session', (req, res) => {
    if (req.session.occuid) {
        res.send(`Session occuid: ${req.session.occuid}`);
    } else {
        res.send('No occuid in session');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
