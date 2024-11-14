const express = require('express');
const path = require('path');
const cors = require('cors');
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
const MtopForm = require('./server/MtopForm'); // 
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./public/scripts/db');
require('dotenv').config(); 

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session' // Existing session table for general login activities
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // Cookie expiration (30 days)
        secure: false // Set to true in production with HTTPS
    }
}));

const permitSession = session({
    store: new pgSession({
        pool: pool,
        tableName: 'permit_session' // New session table specifically for OccuPermit-related sessions
    }),
    secret: process.env.SESSION_SECRET || 'aV3ryC0mpl3xP@ssphr@se1234!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false
    }
});
app.use(cookieParser());

router.use(cors());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use an absolute path to the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', loginProcessRouter);
app.use('/data', Analysis); 
app.use('/',Occuprocess);
app.use('/',Verifying);
app.use('/',FranchiseProcess); 
app.use('/',HeadAdmin); 
app.use('/',HeadAdminaccount); 
app.use('/',PasswordReset); 
app.use('/',AdminChangePass); 
app.use('/',InspectorSignup); 
app.use('/',inspectorchangepass); 
app.use('/',inspectorchangepass2 ); 
app.use('/',Signup); 
app.use("/signup", Occupational);
app.use("/auth", OccupationalApplicants);
app.use("/submit", permitSession, Occuformhandler); 
app.use("/status", permitSession, Occustatus);
app.use('/',SubmissionOccu); 
app.use('/', MtopForm); //


app.get('/test-session', permitSession, (req, res) => {
    if (req.session.occuid) {
        res.send(`Session occuid: ${req.session.occuid}`);
    } else {
        res.send('No occuid in session');
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
