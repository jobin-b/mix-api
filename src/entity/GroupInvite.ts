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
import { Group } from "./Group";
import { User } from "./User";

@Entity()
export class GroupInvite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  receiverId: number;

  @Column({ nullable: true })
  senderId: number;

  // Relations

  @ManyToOne(() => Group, (group) => group.groupInvites, {
    onDelete: "CASCADE",
  })
  group: Group;

  @ManyToOne(() => User, (user) => user.groupInvites, {
    onDelete: "CASCADE",
  })
  receiver: User;

  @ManyToOne(() => User, (user) => user.sentGroupInvites, {
    onDelete: "CASCADE",
  })
  sender: User;

  // Informational

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
