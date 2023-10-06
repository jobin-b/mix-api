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
import { Groups } from "./Groups";
import { Users } from "./Users";

@Entity()
export class GroupInvites extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  receiverId: number;

  @Column({ nullable: true })
  senderId: number;

  // Relations

  @ManyToOne(() => Groups, (group) => group.groupInvites, {
    onDelete: "CASCADE",
  })
  group: Groups;

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
