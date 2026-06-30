import { Body, Controller, Post, Get, Put, Delete, Req, Param, UseGuards, UseInterceptors, UploadedFile, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('whoami')
  @UseGuards(AuthGuard)
  async whoami(@Req() req: any) {
    return this.authService.sanitizeUser(req.user);
  }

  @Put('update')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async update(
    @Req() req: any,
    @Body() updateDto: UpdateProfileDto,
    @UploadedFile() file?: any,
  ) {
    return this.authService.updateProfile(req.user._id.toString(), updateDto, file);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getAllUsers(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access this resource');
    }
    const users = await this.userService.findAll();
    return users.map((user) => this.authService.sanitizeUser(user));
  }

  @Put('users/:id/role')
  @UseGuards(AuthGuard)
  async updateUserRole(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body('role') newRole: string,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access this resource');
    }
    if (req.user._id.toString() === targetUserId) {
      throw new ForbiddenException('You cannot modify your own role');
    }
    if (newRole !== 'admin' && newRole !== 'user') {
      throw new ForbiddenException('Invalid role value');
    }
    const updatedUser = await this.userService.update(targetUserId, { role: newRole });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User role updated successfully',
      user: this.authService.sanitizeUser(updatedUser),
    };
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard)
  async deleteUser(@Req() req: any, @Param('id') targetUserId: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access this resource');
    }
    if (req.user._id.toString() === targetUserId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    const deletedUser = await this.userService.delete(targetUserId);
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User deleted successfully',
      user: this.authService.sanitizeUser(deletedUser),
    };
  }

  @Post('users')
  @UseGuards(AuthGuard)
  async createUser(
    @Req() req: any,
    @Body() registerDto: RegisterDto,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access this resource');
    }
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createdUser = await this.userService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'user',
    });
    return {
      message: 'User created successfully',
      user: this.authService.sanitizeUser(createdUser),
    };
  }

  @Put('users/:id')
  @UseGuards(AuthGuard)
  async editUser(
    @Req() req: any,
    @Param('id') targetUserId: string,
    @Body() updateDto: any,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can access this resource');
    }
    const targetUser = await this.userService.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.role !== undefined) {
      if (updateDto.role !== 'admin' && updateDto.role !== 'user') {
        throw new ForbiddenException('Invalid role value');
      }
      if (req.user._id.toString() === targetUserId && updateDto.role !== targetUser.role) {
        throw new ForbiddenException('You cannot modify your own role');
      }
      updateData.role = updateDto.role;
    }
    if (updateDto.email !== undefined) {
      const email = updateDto.email.toLowerCase().trim();
      if (email !== targetUser.email) {
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
        updateData.email = email;
      }
    }
    if (updateDto.password) {
      updateData.password = await bcrypt.hash(updateDto.password, 10);
    }

    const updatedUser = await this.userService.update(targetUserId, updateData);
    return {
      message: 'User updated successfully',
      user: this.authService.sanitizeUser(updatedUser),
    };
  }
}
