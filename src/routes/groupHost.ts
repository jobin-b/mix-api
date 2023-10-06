import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { verifyHost, verifyToken } from "../config/passport";
import {
  createGroups,
  endGroups,
  removeMember,
} from "../controllers/groupController";
import { getAccessToken } from "../controllers/spotifyAuth";
import { inviteMember } from "../controllers/groupInviteController";

verifyToken(passport);
verifyHost(passport);

const router = express.Router();

/* Post createGroups
  Create a group and playlist for the host

  req body: { name: string, public: boolean }
*/
router.post(
  "/createGroups",
  passport.authenticate("jwt", { session: false }),
  getAccessToken,
  createGroups
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

router.delete(
  "/endGroups",
  passport.authenticate("host", { session: false }),
  endGroups
);

export default router;
