import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Groups } from "../entity/Groups";
import asyncHandler from "express-async-handler";
import { Users } from "../entity/Users";
import { GroupInvites } from "../entity/GroupInvites";
import { createPlaylist, removePlaylist } from "../utils/spotify";
import { io } from "../config/socket";
import { Queues } from "../entity/Queues";

const GroupsRepository = AppDataSource.getRepository(Groups);
const UsersRepository = AppDataSource.getRepository(Users);
const QueuesRepository = AppDataSource.getRepository(Queues);

// Groups Host Routes

export const createGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    if (user.groupId) {
      return res.status(400).json({ error: "Users already has a group" });
    }
    if (!req.accessToken) {
      return res
        .status(400)
        .json({ error: "Users does not have Spotify Premium" });
    }
    const group = new Groups();
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
    const queue = new Queues();
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

// Helper functions for createGroups
const checkUniqueInviteCode = async (inviteCode: string): Promise<boolean> => {
  const group = await GroupsRepository.createQueryBuilder("group")
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

export const endGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const group = (req.user as Users).group;
    const queue = await QueuesRepository.createQueryBuilder("queue")
      .where("queue.groupId = :groupId", { groupId: group.id })
      .select(["queue.playlistId"])
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Groups not found" });
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
    const user = req.user as Users;
    const member = await UsersRepository.createQueryBuilder("user")
      .where("user.id = :id", { id: req.body.id })
      .getOne();
    if (!member) {
      return res.status(400).json({ error: "Users does not exist" });
    } else if (member.groupId !== user.groupId) {
      return res.status(400).json({ error: "Users is not in your group" });
    }
    await UsersRepository.createQueryBuilder()
      .relation(Users, "group")
      .of(member)
      .set(null);
    return res.status(200).json({ success: true });
  }
);

// Groups Member Routes

export const joinGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    if (user.groupId) {
      return res.status(400).json({ error: "Users already has a group" });
    }
    const group = await GroupsRepository.createQueryBuilder("group")
      .where("group.inviteCode = :inviteCode", {
        inviteCode: req.body.inviteCode,
      })
      .getOne();
    if (!group) {
      return res.status(400).json({ error: "Groups does not exist" });
    }
    user.group = group;
    await user.save();
    return res.status(200).json({ success: true });
  }
);

export const leaveGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    await UsersRepository.createQueryBuilder()
      .relation(Users, "group")
      .of(user)
      .set(null);
    return res.status(200).json({ success: true });
  }
);

export const getGroups = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const group = await GroupsRepository.createQueryBuilder("group")
      .leftJoinAndSelect("group.host", "host")
      .leftJoinAndSelect("group.members", "members") // add queue
      .select(["group.id", "group.name", "host.username", "members.username"])
      .where("group.id = :id", { id: user.groupId })
      .getOne();
    if (!group) {
      return res.status(400).json({ error: "Groups does not exist" });
    }
    return res.status(200).json({ success: true, group: group });
  }
);

export const getQueue = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const groupId = (req.user as Users).groupId;
    const queue = await QueuesRepository.createQueryBuilder("queue")
      .leftJoinAndSelect("queue.group", "group")
      .where("group.id = :groupId", { groupId: groupId })
      .getOne();
    if (!queue) {
      return res.status(404).json({ error: "Groups not found" });
    }
    return res.status(200).json({ success: true, queue: queue });
  }
);
