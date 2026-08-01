import {
  Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('此 Email 已被註冊');
    const hashed = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({ email, password: hashed, name });
    return this.signToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) throw new UnauthorizedException('帳號或密碼錯誤');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('帳號或密碼錯誤');
    return this.signToken(user);
  }

  async findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) {
    let user = await this.usersService.findByGoogleId(profile.googleId);
    if (!user) {
      user = await this.usersService.findByEmail(profile.email) ?? null;
      if (user) {
        user.googleId = profile.googleId;
        user.avatarUrl = profile.avatarUrl;
        user = await this.usersService.create(user);
      } else {
        user = await this.usersService.create({
          email:     profile.email,
          googleId:  profile.googleId,
          name:      profile.name,
          avatarUrl: profile.avatarUrl,
        });
      }
    }
    return user;
  }

  signToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id:        user.id,
        email:     user.email,
        name:      user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}