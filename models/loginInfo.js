import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  os: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    enum: ['Mobile', 'Desktop', 'Tablet'],
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
});

const Login = mongoose.model('Login', loginSchema);

export default Login;
