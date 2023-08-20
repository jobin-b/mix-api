import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Group } from "../entity/Group";
import { GroupInvite } from "../entity/GroupInvite";
import { FriendRequest } from "../entity/FriendRequest";
import { Queue } from "../entity/Queue";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "admin",
  database: "p2",
  synchronize: true,
  logging: false,
  entities: [User, Group, GroupInvite, FriendRequest, Queue],
  migrations: [],
  subscribers: [],
});
