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
import { Groups } from "./Groups";
import { GroupInvites } from "./GroupInvites";
import { FriendRequests } from "./FriendRequests";

@Entity()
export class Users extends BaseEntity {
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
  @ManyToMany(() => Users, (user) => user.friends)
  @JoinTable()
  friends: Users[];

  @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.sender)
  friendRequests: FriendRequests[];

  @OneToMany(() => FriendRequests, (friendRequest) => friendRequest.receiver)
  sentFriendRequestsRepository: FriendRequests[];

  // Groups relations
  @ManyToOne(() => Groups, (group) => group.members)
  group: Groups;

  @OneToMany(() => GroupInvites, (groupInvite) => groupInvite.sender)
  groupInvites: GroupInvites[];

  @OneToMany(() => GroupInvites, (groupInvite) => groupInvite.receiver)
  sentGroupsInvitesRepository: GroupInvites[];
}
