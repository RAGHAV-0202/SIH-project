require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tripRoutes = require('./routes/tripRoutes');
const disruptionRoutes = require('./routes/disruptionRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const planningRoutes = require('./routes/planningRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/trips', tripRoutes); // alias for /api/trips
app.use('/api/disruption', disruptionRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/planning', planningRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
