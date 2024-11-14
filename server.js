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
const bodyParser = require("body-parser")
const PORT = 8000;
const router = express.Router();
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
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./public/scripts/db');
require('dotenv').config();

app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: app.get('env') === 'production',
        httpOnly: true
    }
}));

// Middleware for protecting routes
function isAuthenticated(req, res, next) {
    if (req.session && req.session.occuid) {
        next();
    } else {
        res.status(403).send("Access denied. Please log in.");
    }
}

// Use an absolute path to the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Public routes (accessible without authentication)
app.use('/', loginProcessRouter); // Login route
app.use('/signup', Signup); // Signup route

// Protected routes (require authentication)
app.use(isAuthenticated); // Apply middleware to all routes below this line
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
app.use("/signup", Occupational);
app.use("/auth", OccupationalApplicants);
app.use("/submit", Occuformhandler);
app.use("/status", Occustatus);
app.use('/', SubmissionOccu);
app.use('/', MtopForm);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Ensure index.html exists in the 'public' folder
    // Alternatively, use res.send('Welcome to the homepage!');
});

// Test route for session
app.get('/test-session', isAuthenticated, (req, res) => {
    if (req.session.occuid) {
        res.send(`Session occuid: ${req.session.occuid}`);
    } else {
        res.send('No occuid in session');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
