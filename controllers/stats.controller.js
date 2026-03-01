import User from "../models/user.model.js";
import Book from "../models/book.model.js";
import Transaction from "../models/Transection.model.js";
import mongoose from "mongoose"

export const getStudentStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.id);

        // 1. Basic Counts
        const totalLifetimeIssued = await Transaction.countDocuments({ userId });
        const currentlyIssued = await Transaction.countDocuments({ userId, status: 'issued' });

        // 2. Calculate Total Late Fine (Historical + Live)
        const allTransactions = await Transaction.find({ userId });
        
        let totalFine = 0;
        const today = new Date();

        allTransactions.forEach(tr => {
            // Pehle se saved fine add karo
            totalFine += tr.lateFine || 0;

            // Agar book abhi bhi issued hai aur overdue hai, toh live fine calculate karo
            if (tr.status === 'issued' && today > new Date(tr.dueDate)) {
                const diffTime = Math.abs(today - new Date(tr.dueDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalFine += (diffDays * 10); // ₹10 per day logic
            }
        });

        // 3. Chart Data: Monthly Issuing Trend (Last 6 Months)
        const chartData = await Transaction.aggregate([
            { 
                $match: { userId: userId } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$issueDate" }, 
                        year: { $year: "$issueDate" } 
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 } // Pichle 6 mahino ka data
        ]);

        // Chart data ko frontend-friendly format mein convert karna (e.g., "Jan", "Feb")
        const formattedChartData = chartData.map(item => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return {
                month: `${months[item._id.month - 1]}`,
                books: item.count
            };
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalLifetimeIssued,
                currentlyIssued,
                totalFine,
            },
            chartData: formattedChartData
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return res.status(500).json({ 
            message: "Error fetching dashboard data", 
            success: false 
        });
    }
};
//Here we get that dashboard stats for the admin 
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalBooks = await Book.countDocuments();
        const currentlyIssued = await Transaction.countDocuments({ status: 'issued' });
        const lateTransactions = await Transaction.countDocuments({ 
            status: 'issued', 
            dueDate: { $lt: new Date() } 
        });

        // --- TRENDS & CHART DATA ---
        const statsData = await Transaction.aggregate([
            {
                $facet: {
                    // 1. Monthly Borrowing Trend
                    borrowingTrend: [
                        { $group: { 
                            _id: { month: { $month: "$issueDate" }, year: { $year: "$issueDate" } }, 
                            count: { $sum: 1 } 
                        }},
                        { $sort: { "_id.year": 1, "_id.month": 1 } },
                        { $limit: 6 }
                    ],
                    // 2. Recent Transactions for Table
                    recentTransactions: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 6 },
                        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
                        { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'book' } },
                        { $unwind: '$user' },
                        { $unwind: '$book' }
                    ]
                }
            }
        ]);

        // 3. User Growth Trend (Students joining)
        const userGrowth = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { 
                _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, 
                count: { $sum: 1 } 
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 6 }
        ]);

        // 4. Category Distribution
        const categoryData = await Book.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Helper function to format month names
        const formatMonth = (data) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return data.map(item => ({
                month: months[item._id.month - 1],
                count: item.count
            }));
        };

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalBooks,
                currentlyIssued,
                lateTransactions,
                borrowingTrend: formatMonth(statsData[0].borrowingTrend),
                userGrowth: formatMonth(userGrowth),
                categoryDistribution: categoryData.map(c => ({ name: c._id, value: c.count })),
                recentTransactions: statsData[0].recentTransactions
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching admin stats", success: false });
    }
};