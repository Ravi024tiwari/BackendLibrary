import express, { Router } from "express"
import { isAuthenticated,isAdmin } from "../middleware/isAuthenticated.js";
import {issueBook,getMyBooks,returnBook,getAllTransactions,getOverdueTransactions,currentIssueBooks,getStudentHistoryTransaction} from "../controllers/transection.controller.js"

const transectionRouter =Router()

transectionRouter.route("/issue/book").post(isAuthenticated, issueBook);
transectionRouter.route("/my-books").get(isAuthenticated, getMyBooks);

transectionRouter.route('/book/current-issue').get(isAuthenticated,currentIssueBooks);//here we get that
transectionRouter.route("/book/previous/transaction-history").get(isAuthenticated,getStudentHistoryTransaction)


// Admin routes
transectionRouter.route("/transaction/return/:transactionId").put(isAuthenticated, isAdmin, returnBook);
transectionRouter.route("/transaction/history").get(isAuthenticated, isAdmin, getAllTransactions); 

transectionRouter.route("/overdue").get(isAuthenticated, isAdmin, getOverdueTransactions);

export {transectionRouter};