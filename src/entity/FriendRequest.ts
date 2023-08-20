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
import { User } from "./User";

@Entity()
export class FriendRequest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Relations

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
