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

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./public/scripts/db');

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





app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
