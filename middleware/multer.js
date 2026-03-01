import multer from "multer";

const storage = multer.memoryStorage();

const multipleUpload = multer({ storage }).array("files", 3);
 const singleUpload = multer({ storage }).single("file");

export  {multipleUpload,singleUpload};//here we upload the {multiple books + update profile }