import express, { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Users } from "../entity/Users";
import {
  addSongToPlaylist,
  removeSongFromPlaylist,
  searchSong,
} from "../utils/spotify";
import { io } from "../config/socket";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/data-source";
import { Groups } from "../entity/Groups";
import { Queues } from "../entity/Queues";

// TODO: add snapshot_id to all

const QueuesRepository = AppDataSource.getRepository(Queues);
// returns { songs: [spotify track items]}
export const searchSpotify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { query } = req.body;
    const accessToken = req.accessToken as string;
    const response = await searchSong(query, accessToken);
    if (response.error) {
      return res.status(404).json(response);
    }
    return res.status(200).json(response);
  }
);

export const addSong = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { songUri } = req.body;
    const groupId = (req.user as Users).groupId;
    const queue = await QueuesRepository.createQueryBuilder("queue")
      .where("queue.groupId = :groupId", { groupId: groupId })
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Groups not found" });
    }
    const playlistId = queue.playlistId;
    const accessToken = req.accessToken as string;
    const response = await addSongToPlaylist(playlistId, songUri, accessToken);
    if (response.error) {
      return res.status(404).json(response);
    }
    const id = uuidv4();
    io.to(groupId.toString()).emit("songAdded", songUri, id);
    return res.status(200).json({ success: true });
  }
);

export const removeSong = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { songUri, id } = req.body;
    const groupId = (req.user as Users).groupId;
    const queue = await QueuesRepository.createQueryBuilder("queue")
      .where("queue.groupId = :groupId", { groupId: groupId })
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Groups not found" });
    }
    const playlistId = queue.playlistId;
    const accessToken = req.accessToken as string;
    const response = await removeSongFromPlaylist(
      playlistId,
      songUri,
      accessToken
    );
    if (response.error) {
      return res.status(404).json(response);
    }
    io.to(groupId.toString()).emit("songRemoved", songUri, id);
    return res.status(200).json({ success: true });
  }
);

//Feature not implemented yet
export const reorderQueue = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { rangeStart, insertBefore } = req.body;
    const groupId = (req.user as Users).groupId;
    const queue = await QueuesRepository.createQueryBuilder("queue")
      .where("queue.groupId = :groupId", { groupId: groupId })
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Groups not found" });
    }
    const playlistId = queue.playlistId;
    const accessToken = req.accessToken as string;
    const response = await reorderPlaylist(
      playlistId,
      rangeStart,
      insertBefore,
      1,
      accessToken
    );
    if (response.error) {
      return res.status(404).json(response);
    }
    io.to(groupId.toString()).emit("queueReordered", rangeStart, insertBefore);
    return res.status(200).json({ success: true });
  }
);

function reorderPlaylist(
  playlistId: string,
  rangeStart: any,
  insertBefore: any,
  arg2: number,
  accessToken: string
) {
  return { error: "Function not implemented." };
}
