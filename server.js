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

// Authentication middleware
const checkAuth = (req, res, next) => {
    console.log(`Checking auth for ${req.path}`);
    if (req.session.occuid) {
        console.log('User is authenticated');
        next();
    } else {
        console.log('User is not authenticated, redirecting to /applicantlogin.html');
        res.redirect('/applicantlogin.html'); // Redirect to login page
    }
};

// Define routes
app.use('/', loginProcessRouter);
app.use('/data', checkAuth, Analysis);
app.use('/', checkAuth, Occuprocess);
app.use('/', checkAuth, Verifying);
app.use('/', checkAuth, FranchiseProcess);
app.use('/', checkAuth, HeadAdmin);
app.use('/', checkAuth, HeadAdminaccount);
app.use('/', checkAuth, PasswordReset);
app.use('/', checkAuth, AdminChangePass);
app.use('/', checkAuth, InspectorSignup);
app.use('/', checkAuth, inspectorchangepass);
app.use('/', checkAuth, inspectorchangepass2);
app.use('/', checkAuth, Signup);
app.use('/signup', checkAuth, Occupational);
app.use('/auth', checkAuth, OccupationalApplicants);
app.use('/submit', checkAuth, permitSession, Occuformhandler);
app.use('/status', checkAuth, permitSession, Occustatus);
app.use('/', checkAuth, SubmissionOccu);
app.use('/', checkAuth, MtopForm);

// Root route to serve the homepage or a welcome message
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'applicant.html')); // Ensure applicant.html exists in the 'public' folder
    // Alternatively, use res.send('Welcome to the homepage!');
});

// Test session route
app.get('/test-session', checkAuth, permitSession, (req, res) => {
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
