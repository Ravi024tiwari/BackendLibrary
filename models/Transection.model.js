import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  issueDate: { 
    type: Date, 
    default: Date.now 
  },

  dueDate: { //it will auto calculate the dure date of 14 days
    type: Date, 
    default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000) 
  },
  returnDate: { 
    type: Date // Remains null until the admin processes the return
  },
  lateFine: { 
    type: Number, 
    default: 0 
  },
  fineStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'No Fine'],
    default: 'No Fine'
  },
  status: { 
    type: String, 
    enum: ['issued', 'returned'], 
    default: 'issued' 
  }
}, { 
  timestamps: true 
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;