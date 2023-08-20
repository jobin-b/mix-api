import express, { Request, Response, NextFunction } from "express";
import { getAccessToken, spotifyAuth } from "../controllers/spotifyAuth";
import passport from "passport";
import { verifyMember, verifyToken } from "../config/passport";
import {
  addSong,
  removeSong,
  searchSpotify,
} from "../controllers/spotifyController";

verifyToken(passport);
verifyMember(passport);
const router = express.Router();

/* POST login
  PKCE Authentication flow second step
  client provides auth code and codeverifier in req body

  get access token and refresh token from spotify, then create session
*/
router.post(
  "/login",
  passport.authenticate("jwt", { session: false }),
  spotifyAuth
);

/* POST addSong
  Add song to queue playlist

  req body: { songUri: string }
*/
router.post(
  "/addSong",
  passport.authenticate("member", { session: false }),
  getAccessToken,
  addSong
);

/* POST removeSong
  Remove song from queue playlist

  req body: { songUri: string }
*/
router.post(
  "/removeSong",
  passport.authenticate("member", { session: false }),
  getAccessToken,
  removeSong
);

/* POST searchSpotify
  Get a list of 20 songs from spotify based on search query

  req body: { query: string }
*/
router.post(
  "/searchSpotify",
  passport.authenticate("member", { session: false }),
  getAccessToken,
  searchSpotify
);

/* PUT reorderQueue
  Reorder queue playlist TODO: implement

  req body: { rangeStart: number, insertBefore: number }
  range_length is always 1
*/
router.put(
  "/reorderQueue",
  passport.authenticate("member", { session: false }),
  getAccessToken
  // function
);

export default router;
