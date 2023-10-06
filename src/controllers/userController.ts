import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { Users } from "../entity/Users";
import { AppDataSource } from "../config/data-source";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { addFriendship, deleteFriendship } from "../utils/userRelations";

const UsersRepository = AppDataSource.getRepository(Users);

export const userSignUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, password, email } = req.body;
    console.log("hit");
    if (!username || !password || !email) {
      return res.status(404).json({ error: "Invalid signup request" });
    }
    const otherUsers = await UsersRepository.createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (otherUsers) {
      return res.status(404).json({ error: "Usersname taken already" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users();
    user.username = username;
    user.email = email;
    user.hashedPassword = hashedPassword;
    await UsersRepository.save(user);

    //sign jwt
    const token = jwt.sign(
      {
        id: user.id,
      },
      "secret", // TODO: make env
      {
        expiresIn: 1000000, //seconds
      }
    );
    return res.status(200).json({ success: true, token });
  }
);

export const userLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(404).json({ error: "Invalid login request" });
    }
    const user = await UsersRepository.createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (!user) {
      return res.status(404).json({ error: "Invalid credentials" });
    }

    bcrypt.compare(password, user.hashedPassword, (err, response) => {
      if (err) {
        console.log(err);
        return res.status(404).json({ error: err });
      }

      if (response) {
        // passwords match! log user in
        console.log(user);

        //sign jwt
        const token = jwt.sign(
          {
            id: user.id,
          },
          "secret", // TODO: make env
          {
            expiresIn: 1000000, //seconds
          }
        );
        return res.status(404).json({ success: true, token });
      } else {
        // passwords do not match
        return res.status(404).json({ error: "Invalid credentials" });
      }
    });
  }
);

export const userDelete = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { username } = req.body;
    if (!username) {
      return res.status(404).json({ error: "Invalid delete request" });
    }
    const user = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .leftJoinAndSelect("friend.friends", "friendOfFriend")
      .where("user.username = :username", { username })
      .getOne();
    for (const friend of user!.friends) {
      await deleteFriendship(user!, friend);
    }
    const response = await UsersRepository.createQueryBuilder("users")
      .delete()
      .from(Users)
      .where("username = :username", { username })
      .execute();
    if (response.affected && response.affected > 0) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: "Invalid credentials" });
    }
  }
);

export const addFriend = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { friendId } = req.body;
    const id = (req.user as Users).id;
    if (!id || !friendId) {
      return res.status(404).json({ error: "Invalid add friend request" });
    }
    const user = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .where("user.id = :id", { id })
      .getOne();
    const friend = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .where("user.id = :id", { id: friendId })
      .getOne();
    if (!user || !friend) {
      return res.status(404).json({ error: "Invalid credentials" });
    }
    const response = await addFriendship(user, friend);
    return res.status(200).json(response);
  }
);

export const removeFriend = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { friendId } = req.body;
    const id = (req.user as Users).id;
    if (!id || !friendId) {
      return res.status(404).json({ error: "Invalid remove friend request" });
    }
    const user = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .where("user.id = :id", { id })
      .getOne();
    const friend = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .where("user.id = :id", { id: friendId })
      .getOne();
    if (!user || !friend) {
      return res.status(404).json({ error: "Invalid credentials" });
    }
    const response = await deleteFriendship(user, friend);
    return res.status(200).json(response);
  }
);

export const getAllFriends = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const id = (req.user as Users).id;
    const user = await UsersRepository.createQueryBuilder("user")
      .leftJoinAndSelect("user.friends", "friend")
      .select(["user.id", "user.username", "friend.id", "friend.username"])
      .where("user.id = :id", { id })
      .getOne();
    const friends = user!.friends;
    return res.status(200).json({ result: friends ? friends : [] });
  }
);
