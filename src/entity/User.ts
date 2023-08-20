import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Group } from "./Group";
import { GroupInvite } from "./GroupInvite";
import { FriendRequest } from "./FriendRequest";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  hashedPassword: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  spotifyId: string;

  @Column({ nullable: true })
  groupId: number;

  // RELATIONS

  // Friends relaions
  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.sender)
  friendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  sentFriendRequests: FriendRequest[];

  // Group relations
  @ManyToOne(() => Group, (group) => group.members)
  group: Group;

  @OneToMany(() => GroupInvite, (groupInvite) => groupInvite.sender)
  groupInvites: GroupInvite[];

  @OneToMany(() => GroupInvite, (groupInvite) => groupInvite.receiver)
  sentGroupInvites: GroupInvite[];
}
