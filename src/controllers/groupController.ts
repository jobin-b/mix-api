import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Group } from "../entity/Group";
import asyncHandler from "express-async-handler";
import { User } from "../entity/User";
import { GroupInvite } from "../entity/GroupInvite";
import { createPlaylist, removePlaylist } from "../utils/spotify";
import { io } from "../config/socket";
import { Queue } from "../entity/Queue";

const Groups = AppDataSource.getRepository(Group);
const Users = AppDataSource.getRepository(User);
const Queues = AppDataSource.getRepository(Queue);

// Group Host Routes

export const createGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    if (user.groupId) {
      return res.status(400).json({ error: "User already has a group" });
    }
    if (!req.accessToken) {
      return res
        .status(400)
        .json({ error: "User does not have Spotify Premium" });
    }
    const group = new Group();
    group.host = user;
    group.members = [user];
    group.name = req.body.name;
    user.group = group;

    if (req.body.public) {
      group.inviteCode = await generateInviteCode();
    }

    const response = await createPlaylist(user.spotifyId, req.accessToken);
    if (response.error) {
      return res.status(400).json(response);
    }
    const queue = new Queue();
    queue.playlistId = response.playlistId;
    queue.playlistUri = response.playlistUri;

    group.queue = queue;

    await group.save();
    await user.save();

    return res
      .status(200)
      .json({ success: true, inviteCode: group.inviteCode });
  }
);

// Helper functions for createGroup
const checkUniqueInviteCode = async (inviteCode: string): Promise<boolean> => {
  const group = await Groups.createQueryBuilder("group")
    .where("group.inviteCode = :inviteCode", { inviteCode: inviteCode })
    .getOne();
  if (group) {
    return false;
  } else {
    return true;
  }
};

const generateInviteCode = async (): Promise<string> => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 308,915,776 combinations 6 characters long
  let inviteCode = "";
  let unique = false;

  while (!unique) {
    for (let i = 0; i < 6; i++) {
      inviteCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    unique = await checkUniqueInviteCode(inviteCode);
  }

  return inviteCode;
};

export const endGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const group = (req.user as User).group;
    const queue = await Queues.createQueryBuilder("queue")
      .where("queue.groupId = :groupId", { groupId: group.id })
      .select(["queue.playlistId"])
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Group not found" });
    }
    const response = await removePlaylist(queue.playlistId, req.accessToken!);
    if (response.error) {
      return res.status(400).json(response);
    }
    await group.remove();
    io.to(group.id.toString()).emit("groupEnded");

    return res.status(200).json({ success: true });
  }
);

export const removeMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    const member = await Users.createQueryBuilder("user")
      .where("user.id = :id", { id: req.body.id })
      .getOne();
    if (!member) {
      return res.status(400).json({ error: "User does not exist" });
    } else if (member.groupId !== user.groupId) {
      return res.status(400).json({ error: "User is not in your group" });
    }
    await Users.createQueryBuilder()
      .relation(User, "group")
      .of(member)
      .set(null);
    return res.status(200).json({ success: true });
  }
);

// Group Member Routes

export const joinGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    if (user.groupId) {
      return res.status(400).json({ error: "User already has a group" });
    }
    const group = await Groups.createQueryBuilder("group")
      .where("group.inviteCode = :inviteCode", {
        inviteCode: req.body.inviteCode,
      })
      .getOne();
    if (!group) {
      return res.status(400).json({ error: "Group does not exist" });
    }
    user.group = group;
    await user.save();
    return res.status(200).json({ success: true });
  }
);

export const leaveGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    await Users.createQueryBuilder().relation(User, "group").of(user).set(null);
    return res.status(200).json({ success: true });
  }
);

export const getGroup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as User;
    const group = await Groups.createQueryBuilder("group")
      .leftJoinAndSelect("group.host", "host")
      .leftJoinAndSelect("group.members", "members") // add queue
      .select(["group.id", "group.name", "host.username", "members.username"])
      .where("group.id = :id", { id: user.groupId })
      .getOne();
    if (!group) {
      return res.status(400).json({ error: "Group does not exist" });
    }
    return res.status(200).json({ success: true, group: group });
  }
);

export const getQueue = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const groupId = (req.user as User).groupId;
    const queue = await Queues.createQueryBuilder("queue")
      .leftJoinAndSelect("queue.group", "group")
      .where("group.id = :groupId", { groupId: groupId })
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Group not found" });
    }
    return res.status(200).json({ success: true, queue: queue });
  }
);
