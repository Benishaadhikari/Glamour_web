import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createdUser = await this.userService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
    });

    return {
      message: 'User registered successfully',
      user: this.sanitizeUser(createdUser),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    });

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async updateProfile(
    userId: string,
    updateDto: UpdateProfileDto,
    file?: any,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name;
    }

    if (updateDto.email !== undefined) {
      const email = updateDto.email.toLowerCase().trim();
      if (email !== user.email) {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        updateData.email = email;
      }
    }

    // If user wants to change password, verify current password first
    if (updateDto.password) {
      if (!updateDto.currentPassword) {
        throw new UnauthorizedException('Current password is required to set a new password');
      }
      const currentPasswordMatches = await bcrypt.compare(updateDto.currentPassword, user.password);
      if (!currentPasswordMatches) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      updateData.password = await bcrypt.hash(updateDto.password, 10);
    }

    if (file) {
      updateData.profileImage = `/uploads/${file.filename}`;
    }

    const updatedUser = await this.userService.update(userId, updateData);
    return {
      message: 'Profile updated successfully',
      user: this.sanitizeUser(updatedUser),
    };
  }

  sanitizeUser(user: any) {
    const sanitized = user.toObject ? user.toObject() : { ...user };
    const { password, ...rest } = sanitized;
    return rest;
  }
}
