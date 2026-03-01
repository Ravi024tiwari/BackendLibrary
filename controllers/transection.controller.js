import Transaction from "../models/Transection.model.js";
import Book from "../models/book.model.js";
import User from  "../models/user.model.js"

export const issueBook = async (req, res) => {
    try {
        const { bookId ,email} = req.body;

        const user =await User.findOne({email});//here we get that user which the admin should 
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found..firstly create your account..",
            })
        }
        const userId =user._id;//here we get 
        //agar student hai then we assign that book to that user

        // Pehle check karein ki book available hai ya nahi
        const book = await Book.findById(bookId);
        if (!book || book.availableQuantity < 1) {
            return res.status(400).json({
                message: "Book is currently out of stock.",
                success: false
            });
        }

        // Check karein ki student ne wahi book pehle se toh nahi le rakhi
        const alreadyIssued = await Transaction.findOne({ userId, bookId, status: 'issued' });
        if (alreadyIssued) {
            return res.status(400).json({
                message: "You have already issued a copy of this book.",
                success: false
            });
        }

        // Transaction create karein (Due date schema mein auto-calculate hoti hai 14 days)
        const transaction = await Transaction.create({
            userId,
            bookId
        });

        // Inventory decrement karein
        book.availableQuantity -= 1;
        await book.save();

        return res.status(201).json({
            message: "Book issued successfully for 14 days.",
            success: true,
            transaction
        });
    } catch (error) {
        return res.status(500).json({ message: "Issue failed.", success: false });
    }
};

export const getMyBooks = async (req, res) => {
    try {
        const userId = req.id;
        // Populate use kar rahe hain taki book ki details (name, image) bhi mil jayein
        const activeBooks = await Transaction.find({ userId, status: 'issued' }).populate('bookId');

        return res.status(200).json({
            success: true,
            activeBooks
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching your books.", success: false });
    }
};

// get current issue book
export const currentIssueBooks =async(req,res)=>{
    try {
        const userId =req.id;
        if(!userId){
            return res.status(401).json({
                message:"User not found..",
                success:false
            })
        }
        const currentIssuedBook =await Transaction.find({userId,status:"issued"}).populate("userId").populate("bookId");
        //Here we get all the trasaction of the books with current issued
        if(!currentIssuedBook){
            return res.status(401).json({
                message:"Current Transection of book failed..",
                success:false
            })
        }

        return res.status(200).json({
            message:"Current issued book found successfully..",
            success:true,
            currentIssuedBook
        })
    } catch (error) {
        console.log('The current book issue ..',error)
        return res.status(500).json({
            message:"Failed during fetching of current Issue books..",
            success:false,
        })
    }
}
// 4. GET ALL TRANSACTIONS (For Admin History)
export const getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalTransactions = await Transaction.countDocuments();
        const history = await Transaction.find()
            .populate('userId', 'name email mobileNo')
            .populate('bookId', 'name author')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            totalPages: Math.ceil(totalTransactions / limit),
            history
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching history.", success: false });
    }
};

//Here we find all the overDue transection controllers apis
export const getOverdueTransactions = async (req, res) => {
    try {
        const today = new Date();

        // Logic: Status 'issued' ho aur dueDate aaj se purani ho
        const overdue = await Transaction.find({
            status: 'issued',
            dueDate: { $lt: today }
        })
        .populate('userId', 'name email mobileNo')
        .populate('bookId', 'name');

        // Har transaction ke liye "Current Fine" calculate karein (Dynamic)
        const detailedOverdue = overdue.map(trans => {
            const diffTime = Math.abs(today - new Date(trans.dueDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
                ...trans._doc,
                currentFine: diffDays * 10
            };
        });

        return res.status(200).json({
            success: true,
            count: overdue.length,
            overdue: detailedOverdue
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching overdue list", success: false });
    }
};

//Here we update the status of book
// Updated returnBook logic
export const returnBook = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { finePaidAtCounter } = req.body; // Frontend se Boolean aayega

        const transaction = await Transaction.findById(transactionId);
        
        const today = new Date();
        const dueDate = new Date(transaction.dueDate);
        let fine = 0;

        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fine = diffDays * 10;
        }

        transaction.returnDate = today;
        transaction.lateFine = fine;
        transaction.status = 'returned';
        
        // Fine handling logic
        if (fine > 0) {
            transaction.fineStatus = finePaidAtCounter ? 'Paid' : 'Unpaid';
        } else {
            transaction.fineStatus = 'No Fine';
        }

        await transaction.save();
        await Book.findByIdAndUpdate(transaction.bookId, { $inc: { availableQuantity: 1 } });

        return res.status(200).json({
            message: fine > 0 ? `Book returned. Fine: ${fine} (${transaction.fineStatus})` : "Returned on time.",
            success: true,
            fine
        });
    } catch (error) {
        return res.status(500).json({ message: "Return error", success: false });
    }
};

//get all trasaction history for the particular user

export const getStudentHistoryTransaction =async(req,res)=>{
    try {
        const userId =req.id;

        if(!userId){
            return res.status(401).json({
                success:false,
                message:"User not found.."
            })
        }
        const transactionHistory =await Transaction.find({userId,status:"returned"}).populate("bookId");
        //here we fetch all transaction history of transaction
        if(!transactionHistory){
            return res.status(401).json({
                success:false,
                message:"failed to fetch the previous transaction history .."
            })
        }

        return res.status(200).json({
            success:true,
            message:"Successfully fetch the transaction history..",
            transactionHistory
        })
    } catch (error) {
        console.log('Error during fetching the transaction history..',error);
        return res.status(500).json({
            message:",Error during fetching the transaction history",
            success:false
        })
    }
}