import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user.context.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { EmailService } from '../../notifications/email.service';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    readonly usersService: UsersService,
    private emailService: EmailService,
  ) {}
  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string) {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return {
      accessToken,
    };
  }
  async confirmRegistration(code: string): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(code);
    if (!user) {
      throw new BadRequestDomainException([
        {
          message: 'invalid confirmation code',
          key: 'code',
        },
      ]);
    }
    if (user.isEmailConfirmed) {
      throw new BadRequestDomainException([
        { message: 'user already confirmed', key: 'code' },
      ]);
    }

    if (
      user.confirmationCodeExpiration &&
      user.confirmationCodeExpiration < new Date()
    ) {
      throw new BadRequestDomainException([
        { message: 'Confirmation code expired', key: 'code' },
      ]);
    }

    user.isEmailConfirmed = true;
    user.confirmationCode = null; // Теперь это допустимо, так как confirmationCode может быть строкой или null
    user.confirmationCodeExpiration = null; // То же самое для confirmationCodeExpiration

    await user.save();
  }
  async passwordRecovery(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestDomainException([
        { message: 'such user not found', key: 'email' },
      ]);
    }
  }
  async emailResending(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestDomainException([
        { message: 'such user not found', key: 'email' },
      ]);
    }
    if (user.isEmailConfirmed) {
      throw new BadRequestDomainException([
        { message: 'user already confirmed', key: 'email' },
      ]);
    }

    const newconfirmationCode = 'newuuid';

    user.setConfirmationCode(newconfirmationCode);
    await this.usersRepository.save(user);
    await this.emailService
      .sendConfirmationEmail(user.email, newconfirmationCode)
      .catch(console.error);
  }
}
