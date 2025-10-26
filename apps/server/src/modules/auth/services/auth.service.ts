import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async findOrCreateUser(provider: string, sub: string, email: string): Promise<User> {
    return this.authRepository.findOrCreateUser(provider, sub, email);
  }
}
