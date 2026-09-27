import mongoose from 'mongoose';

/**
 * Connects Express backend to MongoDB Atlas using Mongoose.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === '') {
    console.warn('\n========================================================================');
    console.warn('⚠️  [MongoDB Atlas]');
    console.warn('Paste your MongoDB Atlas connection string into "MONGO_URI".');
    console.warn('File location: backend/.env');
    console.warn('Example:');
    console.warn('MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/reaching_the_unreached?retryWrites=true&w=majority');
    console.warn('========================================================================\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ [MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
    return false;
  }
};
