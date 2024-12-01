const mongoose = require('mongoose');

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return; // Database is already connected
  }

  await mongoose.connect(
    'mongodb+srv://kfaizanahmad35:NDeaIWWHYqJWnd3P@cluster0.0refn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
};

// Define the schema for the form data
const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const FormData = mongoose.models.FormData || mongoose.model('FormData', formSchema);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      await connectToDatabase();

      const { name, email, message } = req.body;

      // Save the form data to MongoDB
      const newFormData = new FormData({
        name,
        email,
        message,
      });

      await newFormData.save();

      res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
      console.error('Error submitting form:', error);
      res.status(500).json({ message: 'Error submitting form', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
