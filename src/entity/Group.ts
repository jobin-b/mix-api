import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { GroupInvite } from "./GroupInvite";
import { Queue } from "./Queue";

@Entity()
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  inviteCode: string;

  @Column({ nullable: true })
  hostId: number;

  @Column({ nullable: true })
  queueId: number;

  // Relations

  @OneToMany(() => User, (user) => user.group)
  members: User[];

  @OneToOne(() => User)
  @JoinColumn()
  host: User;

  @OneToOne(() => Queue, { cascade: true })
  @JoinColumn()
  queue: Queue;

  @OneToMany(() => GroupInvite, (groupInvite) => groupInvite.group)
  groupInvites: GroupInvite[];
}
