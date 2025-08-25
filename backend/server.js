require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const cron = require('node-cron')
const app = express();
const port = process.env.PORT || 5000;
const session = require("express-session");
const { connectToMilestoneDB, connetToTransactionsDb } = require("./dbConfig/connection");
const authRoutes = require('./routes/Auth');
const { sendEmailController } = require("./controllers/MailController");
const verifyUser = require("./middlewares/VerifyUser");
const { pendingTransactionsNotification, springVerifyStatusCheck } = require("./utils/scheduledTasks");
const MongoStore = require("connect-mongo");
const router = require("./routes");
const { TRANSACTION_DB_NAME } = require("./utils/stringConstants");
connetToTransactionsDb();
const milestoneDbConnection = connectToMilestoneDB();
const leaderboardRoutes = require('./routes/leaderboard'); 

// Configure session middleware
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: TRANSACTION_DB_NAME, // database name
      ttl: 24 * 60 * 60, // 1-day session expiration
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Middleware to provide db access
function dbAccess(req, res, next) {
  req.milestoneDb = milestoneDbConnection;
  next();
}

app.use(dbAccess); // Use the middleware
app.use('/api', leaderboardRoutes);
app.use('/auth', authRoutes);
app.post('/api/send-mail', verifyUser, sendEmailController);
// Centralized Routes
app.use('/api', router);

// wildcard route to serve react using express
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}/`);
  // scheduling jobs
  // cron.schedule('0 9 5 * *', pendingTransactionsNotification);
  
  // cron.schedule("0 11 * * *", () => {
  //   console.log("Running SpringVerify daily background check status cron at 11:00 AM...");
  //   springVerifyStatusCheck();
  // });
});