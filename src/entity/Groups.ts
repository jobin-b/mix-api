import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./Users";
import { GroupInvites } from "./GroupInvites";
import { Queues } from "./Queues";

@Entity()
export class Groups extends BaseEntity {
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

  @OneToMany(() => Users, (user) => user.group)
  members: Users[];

  @OneToOne(() => Users)
  @JoinColumn()
  host: Users;

  @OneToOne(() => Queues, { cascade: true })
  @JoinColumn()
  queue: Queues;

  @OneToMany(() => GroupInvites, (groupInvite) => groupInvite.group)
  groupInvites: GroupInvites[];
}
