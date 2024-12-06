import mongoose from 'mongoose';
import express from 'express';

// Initialize the Express app
const app = express();
app.use(express.json()); // to parse JSON body in POST requests

// Ensure MongoDB URI is set at the beginning of the app
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1); // Exit the application if Mongo URI is not defined
}

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, // For older versions of Mongoose (Mongoose 5.x)
      useFindAndModify: false, // For avoiding deprecation warnings
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Database connection error');
  }
};

const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
});

const FormData = mongoose.models.FormData || mongoose.model('FormData', formSchema);

app.post('/api/form', async (req, res) => {
  try {
    await connectToDatabase();

    const { name, email, message } = req.body;

    // Validate if the required fields are present
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Optional: Validate email format (using validator package)
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const newFormData = new FormData({ name, email, message });
    await newFormData.save();

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res
      .status(error.name === 'MongoNetworkError' ? 503 : 500)
      .json({ message: 'Error submitting form', error: error.message });
  }
});

// Use the provided port or default to 3000 for local development
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
