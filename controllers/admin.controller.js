import User from "../models/user.model.js";
import Transaction from "../models/Transection.model.js";

export const getAllStudents = async (req, res) => {
    try {
        // 1. Pagination aur Search Parameters nikalna
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        // 2. Aggregation Pipeline: Users aur Transactions ko join karne ke liye
        const students = await User.aggregate([
            // Stage 1: Filter students and search term
            {
                $match: {
                    role: 'student',
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } }
                    ]
                }
            },

            // Stage 2: Transactions collection se join karna (Lookup)
            {
                $lookup: {
                    from: "transactions", // MongoDB collection name
                    let: { studentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$studentId"] },
                                        { $eq: ["$status", "issued"] } // Sirf wo books jo abhi return nahi hui
                                    ]
                                }
                            }
                        }
                    ],
                    as: "issuedBooks"
                }
            },

            // Stage 3: Data format karna aur count nikalna
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    createdAt: 1,
                    activeBooksCount: { $size: "$issuedBooks" } // Direct count mil jayega
                }
            },

            // Stage 4: Sorting & Pagination
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        // 3. Total Count nikalna (Frontend pagination UI ke liye)
        const totalStudents = await User.countDocuments({
            role: 'student',
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            students,
            pagination: {
                totalStudents,
                totalPages: Math.ceil(totalStudents / limit),
                currentPage: page,
                pageSize: limit
            }
        });

    } catch (error) {
        console.error("Error in getAllStudents:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch students list"
        });
    }
};