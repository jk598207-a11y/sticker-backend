import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true, select: false })
    password?: string;

    @Index()
    @Column({ nullable: true ,unique: true,name:'google_id'})
    googleId?: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true, name:'avatar_url'})
    avatarUrl?: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role!: UserRole;

    @Column({ name:'free_export_used', default: 0 })
    freeExportUsed!: number;

    @CreateDateColumn({ name:'created_at'})
    createdAt!: Date;

    @UpdateDateColumn({ name:'updated_at'})
    updatedAt!: Date;
}