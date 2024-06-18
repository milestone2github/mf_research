require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const session = require("express-session");
const { connectToMilestoneDB, connetToTransactionsDb } = require("./dbConfig/connection");
const authRoutes = require('./routes/Auth')
const dataRoutes = require('./routes/Data')
const opsRoutes = require('./routes/OpsTransactions')

connetToTransactionsDb();
const milestoneDbConnection = connectToMilestoneDB();

// Configure session middleware
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using https
      maxAge: 24 * 3600000,
    },
  })
);

// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(cors({ credentials: true, origin: process.env.ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Middleware to provide db access
function dbAccess(req, res, next) {
  req.milestoneDb = milestoneDbConnection;
  next();
}

app.use(dbAccess); // Use the middleware


app.use('/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ops-dash', opsRoutes);

// wildcard route to serve react using express
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}/`);
});
