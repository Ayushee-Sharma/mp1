import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Attempt connection to MongoDB Atlas
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 [Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔗 [Server] Health check endpoint: http://localhost:${PORT}/api/health`);
  });
};

startServer();
