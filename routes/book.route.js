import express, { Router } from "express"
import { isAuthenticated,isAdmin } from "../middleware/isAuthenticated.js";
import { multipleUpload } from "../middleware/multer.js";

import { addBook,getAllBooks,getBookById,updateBook,deleteBook } from "../controllers/book.controller.js";


const bookRouter =Router()

bookRouter.route("/book/add").post(isAuthenticated, isAdmin, multipleUpload, addBook);

bookRouter.route("/all/books").get(getAllBooks);

bookRouter.route("/get/:id").get(getBookById);

bookRouter.route("/book/update/:id").put(isAuthenticated, isAdmin, updateBook);

bookRouter.route("/book/delete/:id").delete(isAuthenticated, isAdmin, deleteBook);


export  {bookRouter};