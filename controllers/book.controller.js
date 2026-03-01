import Book from "../models/book.model.js";
import Transaction from "../models/Transection.model.js";
import cloudinary from "../config/cloudinary.js";
import getDataUri from "../utils/datarui.js";

// 1. ADD NEW BOOK (Admin Only + Multiple Images)
export const addBook = async (req, res) => {
    try {
        const { name, author, category, totalQuantity, description } = req.body;
        const files = req.files; // Multer se aayi hui images array

        if (!name || !author || !category || !totalQuantity) {
            return res.status(400).json({
                message: "Basic details (Name, Author, Category, Quantity) are required.",
                success: false
            });
        }

        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "At least one book image is required.",
                success: false
            });
        }

        // Multiple images ko Cloudinary par upload karne ka logic
        const imageUploadPromises = files.map(file => {
            const fileUri = getDataUri(file);
            return cloudinary.uploader.upload(fileUri.content, {
                folder: "library_management/books",
            });
        });

        const uploadResponses = await Promise.all(imageUploadPromises);
        const imageUrls = uploadResponses.map(res => res.secure_url);

        const book = await Book.create({
            name,
            author,
            category,
            totalQuantity,
            availableQuantity: totalQuantity, // Initial stock sync
            description,
            images: imageUrls
        });

        return res.status(201).json({
            message: `Book added successfully with ${imageUrls.length} images!`,
            success: true,
            book
        });
    } catch (error) {
        console.error("Add Book Error:", error);
        return res.status(500).json({
            message: "Failed to add book.",
            success: false
        });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const { category, search } = req.query;
        
        // Pagination logic
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8; // Ek page par 8 books
        const skip = (page - 1) * limit;

        let query = {};
        if (category && category !== "All") query.category = category;
        
        // Search logic using Text Index
        if (search) {
            query.$text = { $search: search };
        }

        const totalBooks = await Book.countDocuments(query);
        const books = await Book.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalBooks / limit),
            totalBooks,
            books
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books.", success: false });
    }
};

// 3. GET SINGLE BOOK BY ID
export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found", success: false });

        return res.status(200).json({
            success:true,
            message:"Book fetched successfully..",
            book,
             });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching details", success: false });
    }
};

// 4. UPDATE BOOK (Admin Only)
export const updateBook = async (req, res) => {
    try {
        const { totalQuantity } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found", success: false });

        // Agar quantity update ho rahi hai toh stock sync karein
        if (totalQuantity !== undefined) {
            const difference = totalQuantity - book.totalQuantity;
            req.body.availableQuantity = book.availableQuantity + difference;
        }

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });

        return res.status(200).json({
            message: "Book updated successfully.",
            success: true,
            book: updatedBook
        });
    } catch (error) {
        return res.status(500).json({ message: "Update failed", success: false });
    }
};

export const deleteBook = async (req, res) => {
    try {
        // Check karein ki book kisi student ke paas issue toh nahi hai
        const activeTransaction = await Transaction.findOne({ bookId: req.params.id, status: 'issued' });
        
        if (activeTransaction) {
            return res.status(400).json({
                message: "Cannot delete. This book is currently with a student.",
                success: false
            });
        }

        await Book.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: "Book deleted from inventory.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: "Delete failed", success: false });
    }
};