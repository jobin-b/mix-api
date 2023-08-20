import express, { Request, Response, NextFunction } from "express";
import {
  addFriend,
  removeFriend,
  getAllFriends,
} from "../controllers/userController";
import passport from "passport";
import { verifyToken } from "../config/passport";

verifyToken(passport);
const router = express.Router();

router.put("/add", passport.authenticate("jwt", { session: false }), addFriend);

router.put(
  "/remove",
  passport.authenticate("jwt", { session: false }),
  removeFriend
);

router.get(
  "/allFriends",
  passport.authenticate("jwt", { session: false }),
  getAllFriends
);

export default router;
