import express from "express";
import passport from "passport";
import { verifyMember } from "../config/passport";
import {
  createGroup,
  inviteMember,
  removeMember,
} from "../controllers/groupController";
import { getAccessToken } from "../controllers/spotifyAuth";

verifyMember(passport);

const router = express.Router();

router.post(
  "/addSong",
  passport.authenticate("jwt", { session: false }),
  getAccessToken,
  createGroup
);

router.put(
  "/inviteMember",
  passport.authenticate("host", { session: false }),
  inviteMember
);

router.put(
  "/removeMember",
  passport.authenticate("host", { session: false }),
  removeMember
);

export default router;
