import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Users } from "./Users";

@Entity()
export class FriendRequests extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Relations

  @ManyToOne(() => Users, (user) => user.groupInvites, {
    onDelete: "CASCADE",
  })
  receiver: Users;

  @ManyToOne(() => Users, (user) => user.sentGroupsInvitesRepository, {
    onDelete: "CASCADE",
  })
  sender: Users;

  // Informational

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
