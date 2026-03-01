import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  author: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true // Essential for your frontend filter feature
  },
  totalQuantity: { 
    type: Number, 
    required: true 
  },
  availableQuantity: { 
    type: Number, 
    required: true // Decrements when issued, increments when returned
  },
  images: [{ 
    type: String // Supports an array of image URLs
  }],
  description: { 
    type: String 
  },
  category: { 
    type: String, 
    required: true,
    // Yahan humne categories ko restrict kar diya hai
    enum: [
      'Fiction', 
      'Placement', 
      'Programming', 
      'History', 
      'Biography', 
      'Mathematics', 
      'Business', 
      'Other'
    ],
    default: 'Other'
  },
}, { 
  timestamps: true 
});

bookSchema.index({ name: 'text', author: 'text', category: 'text' });

const Book = mongoose.model('Book', bookSchema);

export default Book;