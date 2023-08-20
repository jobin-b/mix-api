import express from "express";
import passport from "passport";
import { verifyToken, verifyHost, verifyMember } from "../config/passport";
import {
  getGroup,
  joinGroup,
  leaveGroup,
} from "../controllers/groupController";

verifyToken(passport);
verifyMember(passport);

const router = express.Router();

router.post(
  "/joinGroup",
  passport.authenticate("jwt", { session: false }),
  joinGroup
);

router.post(
  "/leaveGroup",
  passport.authenticate("member", { session: false }),
  leaveGroup
);

router.get(
  "/getGroup",
  passport.authenticate("member", { session: false }),
  getGroup
);

router.get(
  "/getQueue",
  passport.authenticate("member", { session: false }),
  getGroup
);

export default router;
