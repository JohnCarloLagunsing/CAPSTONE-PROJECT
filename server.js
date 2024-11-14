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

// Middleware configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // General session table
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: app.get('env') === 'production', // Use secure cookies in production
        httpOnly: true
    }
}));

const permitSession = session({
    store: new pgSession({
        pool: pool,
        tableName: 'permit_session' // Permit session table
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: app.get('env') === 'production',
        httpOnly: true
    }
});

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) { // Check if session exists and userId is present
        next(); // Proceed to the next middleware or route handler
    } else {
        res.redirect('/applicantlogin.html'); // Redirect to login page if not authenticated
    }
}

// Define routes
app.use('/', loginProcessRouter); // Login route does not need authentication

// Apply the middleware to protect routes
app.use('/data', isAuthenticated, Analysis);
app.use('/verify', isAuthenticated, Verifying);
app.use('/franchise', isAuthenticated, FranchiseProcess);
app.use('/headadmin', isAuthenticated, HeadAdmin);
app.use('/adminaccount', isAuthenticated, HeadAdminaccount);
app.use('/changepass', isAuthenticated, AdminChangePass);
app.use('/inspector', isAuthenticated, InspectorSignup);
app.use('/submit', isAuthenticated, permitSession, Occuformhandler);
app.use('/status', isAuthenticated, permitSession, Occustatus);
app.use('/submission', isAuthenticated, SubmissionOccu);
app.use('/mtopform', isAuthenticated, MtopForm);

// Unprotected routes
app.use('/', Occuprocess);
app.use('/', PasswordReset);
app.use('/', inspectorchangepass);
app.use('/', inspectorchangepass2);
app.use('/', Signup);
app.use('/signup', Occupational);
app.use('/auth', OccupationalApplicants);

// Root route to serve the homepage or a welcome message
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'applicant.html')); // Ensure index.html exists in the 'public' folder
});

// Test session route
app.get('/test-session', permitSession, (req, res) => {
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
