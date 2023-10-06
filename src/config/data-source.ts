import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "../entity/Users";
import { Groups } from "../entity/Groups";
import { GroupInvites } from "../entity/GroupInvites";
import { FriendRequests } from "../entity/FriendRequests";
import { Queues } from "../entity/Queues";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "jobinbabu",
  password: "",
  database: "mix",
  synchronize: true,
  logging: false,
  entities: [Users, Groups, GroupInvites, FriendRequests, Queues],
  migrations: [],
  subscribers: [],
});
