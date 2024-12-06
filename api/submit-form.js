import mongoose from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const FormData = mongoose.models.FormData || mongoose.model('FormData', formSchema);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase();

      const { name, email, message } = req.body;

      const newFormData = new FormData({ name, email, message });
      await newFormData.save();

      res.status(200).json({ message: 'Form submitted successfully!' });
    } catch (error) {
      console.error('Error submitting form:', error);
      res
        .status(error.name === 'MongoNetworkError' ? 503 : 500)
        .json({ message: 'Error submitting form', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
