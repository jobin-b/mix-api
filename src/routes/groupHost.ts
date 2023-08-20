import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { verifyHost, verifyToken } from "../config/passport";
import {
  createGroup,
  endGroup,
  removeMember,
} from "../controllers/groupController";
import { getAccessToken } from "../controllers/spotifyAuth";
import { inviteMember } from "../controllers/groupInviteController";

verifyToken(passport);
verifyHost(passport);

const router = express.Router();

/* Post createGroup
  Create a group and playlist for the host

  req body: { name: string, public: boolean }
*/
router.post(
  "/createGroup",
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

router.delete(
  "/endGroup",
  passport.authenticate("host", { session: false }),
  endGroup
);

export default router;
