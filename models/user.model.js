import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
  mobileNo: { 
    type: String, 
    required: true ,
    minLength: [10, 'mobile number must be exactly 10 char'],
    maxLength: [10, 'mobile number must be exactly 10 char']
  },
  image: { 
    type: String, 
    default: "" // We will handle profile image uploads later
  }
}, { 
  timestamps: true // This automatically adds 'createdAt' and 'updatedAt'
});

userSchema.index({name:"text",email:"text"})

const User = mongoose.model('User', userSchema);
export default User;