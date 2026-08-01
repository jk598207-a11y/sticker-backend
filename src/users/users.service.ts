import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./users.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}
  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        avatarUrl: true,
        googleId: true,
      },
    });
  }
  findByGoogleId(googleId: string) {
    return this.repo.findOne({
      where: { googleId },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        avatarUrl: true,
        googleId: true,
      },
    });
  }
  findById(id: string) {
    return this.repo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        googleId: true,
      },
    });
  }

  create(user: Partial<User>) {
    return this.repo.save(this.repo.create(user));
  }
}
