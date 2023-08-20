import express, { Request, Response, NextFunction } from "express";
import {
  userLogin,
  userSignUp,
  userDelete,
} from "../controllers/userController";
const router = express.Router();

router.post("/signup", userSignUp);

router.post("/login", userLogin);

router.delete("/", userDelete);

export default router;
