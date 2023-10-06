// create queue playlist entity as Queues

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Groups } from "./Groups";

@Entity()
export class Queues extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  snapshotId: string;

  @Column()
  playlistId: string;

  @Column()
  playlistUri: string;

  @Column("text", { array: true, default: [] })
  songs: string[];
}
