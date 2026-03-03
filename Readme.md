
# 📚 LibriFlow Backend – The Intelligent Library Engine

**LibriFlow** is a robust, scalable, and high-performance API system engineered with **Node.js** and **MongoDB**. It serves as the core intelligence unit for a modern library ecosystem, orchestrating real-time book transactions, sophisticated data analytics, and secure identity management.

Designed for high concurrency, the backend handles complex business logic such as automated fine calculations, inventory tracking, and multi-role access control, ensuring a seamless experience for both Administrators and Students.

---

## 🚀 Key Features

* **🔐 Secure Authentication:** JWT-based sessions with `httpOnly` and `sameSite` cookie security.
* **🎭 RBAC (Role-Based Access Control):** Granular permissions for Admin and Student portals.
* **📊 Advanced Analytics:** MongoDB Aggregation Pipelines for generating monthly borrowing trends and user growth insights.
* **🖼️ Media Integration:** Seamless image processing with **Cloudinary** for profile avatars and book covers.
* **💸 Fine Management:** Automated logic to calculate late return fees based on dynamic due dates.
> The fine is calculated using the formula:
> 
> $$Fine = \max(0, (\text{ReturnDate} - \text{DueDate}) \times \text{DailyRate})$$
> 
> 



---

## 🛠️ Tech Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** MongoDB Atlas (NoSQL)
* **ODM:** Mongoose
* **Auth:** JSON Web Tokens (JWT) & bcryptjs
* **File Handling:** Multer & Cloudinary

---

## 💻 Local Setup Instructions

Follow these steps to get the backend running on your local machine:

### 1. Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* A MongoDB Atlas Cluster (or local MongoDB)

### 2. Clone the Repository

```bash
git clone https://github.com/Ravi024tiwari/BackendLibrary
cd BackendLibrary

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add your credentials:

```env

PORT=8080
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
NODE_ENV=development

# Cloudinary Config
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

```

### 5. Project Directory Structure

### 6. Run the Server

```bash
# Start in development mode (using nodemon)
npm run dev

# Start in production mode
npm start

```

The server should now be running at `http://localhost:8080`.

---

## 🔌 API Documentation (Quick Reference)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Authenticate user & set cookie | Public |
| `POST` | `/api/v1/user/register` | Create a new student/admin account | Public |
| `GET` | `/api/v1/admin/stats` | Fetch dashboard analytical trends | Admin |
| `POST` | `/api/v1/book/add` | Add new book with multiple images | Admin |
| `POST` | `/api/v1/transaction/issue` | Request a book issuance | Student |

---

## 🛡️ Vercel Deployment Notes

When deploying to Vercel, ensure the following:

1. Set `NODE_ENV=production` in Vercel settings.
2. Whiltelist `0.0.0.0/0` in your MongoDB Atlas Network Access.
3. Set `secure: true` and `sameSite: 'none'` in your cookie configuration for cross-site compatibility.



