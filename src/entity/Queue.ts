// create queue playlist entity as Queue

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Group } from "./Group";

@Entity()
export class Queue extends BaseEntity {
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
