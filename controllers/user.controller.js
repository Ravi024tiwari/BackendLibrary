import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import getDataUri from "../utils/datarui.js"

export const getProfile = async (req, res) => {
    try {
        const userId = req.id; // isAuthenticated middleware se mil raha hai
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching profile.", success: false });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name, mobileNo } = req.body;
        const file = req.file;

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });

        // Agar user image update kar raha hai
        if (file) {
            const fileUri = getDataUri(file);
            const myCloud = await cloudinary.uploader.upload(fileUri.content, {
                folder: "library_management/profiles",
            });
            user.image = myCloud.secure_url;
        }

        // Baki fields update karein
        if (name) user.name = name;
        if (mobileNo) user.mobileNo = mobileNo;

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully.",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Update failed.", success: false });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;// here we get that user

        // Check karein ki user exist karta hai ya nahi
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "User deleted successfully.",
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: "Delete failed.", success: false });
    }
};

// Admin search student logic
//Here we are searching the student
export const searchStudent = async (req, res) => {
    try {
        const { query } = req.query; // Search keyword

        if (!query) {
            return res.status(400).json({ message: "Search query is required", success: false });
        }

        // Student search logic (Name, Email, ya Mobile Number par regex match)
        const students = await User.find({
            role: 'student',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { mobileNo: { $regex: query, $options: 'i' } }
            ]
        }).select("-password");

        return res.status(200).json({
            success: true,
            students
        });
    } catch (error) {
        return res.status(500).json({ message: "Error searching students.", success: false });
    }
};