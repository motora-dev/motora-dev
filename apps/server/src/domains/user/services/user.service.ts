import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { UserRepository } from '$domains/user/repositories';
import { BusinessLogicError } from '$exceptions';

import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserByProvider(provider: string, sub: string): Promise<User> {
    const user = await this.userRepository.getUserByProvider(provider, sub);
    if (!user) {
      throw new BusinessLogicError(ERROR_CODE.USER_NOT_FOUND);
    }
    return user;
  }

  async findOrCreateUser(provider: string, sub: string, email: string): Promise<User> {
    const existUser = await this.userRepository.getUserByProvider(provider, sub);
    if (existUser) {
      return existUser;
    }
    return await this.userRepository.findOrCreateUser(provider, sub, email);
  }
}
