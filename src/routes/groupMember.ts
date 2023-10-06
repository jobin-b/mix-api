import express from "express";
import passport from "passport";
import { verifyToken, verifyHost, verifyMember } from "../config/passport";
import {
  getGroups,
  joinGroups,
  leaveGroups,
} from "../controllers/groupController";

verifyToken(passport);
verifyMember(passport);

const router = express.Router();

router.post(
  "/joinGroups",
  passport.authenticate("jwt", { session: false }),
  joinGroups
);

router.post(
  "/leaveGroups",
  passport.authenticate("member", { session: false }),
  leaveGroups
);

router.get(
  "/getGroups",
  passport.authenticate("member", { session: false }),
  getGroups
);

router.get(
  "/getQueue",
  passport.authenticate("member", { session: false }),
  getGroups
);

export default router;
