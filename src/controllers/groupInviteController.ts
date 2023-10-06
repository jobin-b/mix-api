import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Users } from "../entity/Users";
import { GroupInvites } from "../entity/GroupInvites";
import { Groups } from "../entity/Groups";
import { AppDataSource } from "../config/data-source";

const GroupsRepository = AppDataSource.getRepository(Groups);
const UsersRepository = AppDataSource.getRepository(Users);

// Groups Invite Routes

export const inviteMember = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const reciever = await UsersRepository.createQueryBuilder("user")
      .where("user.id = :id", { id: req.body.id })
      .getOne();
    if (!reciever) {
      return res.status(400).json({ error: "Users does not exist" });
    } else if (reciever.groupId) {
      return res.status(400).json({ error: "Users already is in a group" });
    }
    const group = await GroupsRepository.createQueryBuilder("group")
      .leftJoinAndSelect("group.members", "members")
      .where("group.id = :id", { id: user.groupId })
      .getOne();
    const groupInvite = new GroupInvites();
    groupInvite.group = group!;
    groupInvite.receiver = reciever;
    groupInvite.sender = user;
    await groupInvite.save();

    return res.status(200).json({ success: true });
  }
);

export const acceptInvite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const groupInvite = await GroupInvites.createQueryBuilder("groupInvite")
      .leftJoinAndSelect("groupInvite.group", "group")
      .where("groupInvite.id = :id", { id: req.body.id })
      .getOne();
    if (!groupInvite) {
      return res.status(400).json({ error: "Invite does not exist" });
    } else if (groupInvite.receiverId !== user.id) {
      return res.status(400).json({ error: "Invite is not for you" });
    }
    user.group = groupInvite.group;
    await user.save();
    await groupInvite.remove();
    return res.status(200).json({ success: true });
  }
);

export const declineInvite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const groupInvite = await GroupInvites.createQueryBuilder("groupInvite")
      .leftJoinAndSelect("groupInvite.group", "group")
      .where("groupInvite.id = :id", { id: req.body.id })
      .getOne();
    if (!groupInvite) {
      return res.status(400).json({ error: "Invite does not exist" });
    } else if (groupInvite.receiverId !== user.id) {
      return res.status(400).json({ error: "Invite is not for you" });
    }
    await groupInvite.remove();
    return res.status(200).json({ success: true });
  }
);

export const cancelInvite = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const groupInvite = await GroupInvites.createQueryBuilder("groupInvite")
      .leftJoinAndSelect("groupInvite.group", "group")
      .where("groupInvite.id = :id", { id: req.body.id })
      .getOne();
    if (!groupInvite) {
      return res.status(400).json({ error: "Invite does not exist" });
    } else if (groupInvite.senderId !== user.id) {
      return res.status(400).json({ error: "Invite is not yours" });
    }
    await groupInvite.remove();
    return res.status(200).json({ success: true });
  }
);

export const getRecievedInvites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const groupInvites = await GroupInvites.createQueryBuilder("groupInvite")
      .leftJoinAndSelect("groupInvite.group", "group")
      .leftJoinAndSelect("groupInvite.sender", "sender")
      .select(["groupInvite.id", "group.name", "sender.username"])
      .where("groupInvite.receiverId = :id", { id: user.id })
      .getMany();
    return res.status(200).json({ success: true, groupInvites: groupInvites });
  }
);

export const getSentInvites = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const user = req.user as Users;
    const groupInvites = await GroupInvites.createQueryBuilder("groupInvite")
      .leftJoinAndSelect("groupInvite.receiver", "receiver")
      .select(["groupInvite.id", "receiver.username"])
      .where("groupInvite.senderId = :id", { id: user.id })
      .getMany();
    return res.status(200).json({ success: true, groupInvites: groupInvites });
  }
);
