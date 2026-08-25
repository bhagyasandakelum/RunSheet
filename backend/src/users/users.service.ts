import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.prisma.user.update({
      where: { userId },
      data: {
        ...(updateProfileDto.firstName !== undefined && { firstName: updateProfileDto.firstName }),
        ...(updateProfileDto.lastName !== undefined && { lastName: updateProfileDto.lastName }),
        ...(updateProfileDto.phoneNumber !== undefined && { phoneNumber: updateProfileDto.phoneNumber }),
        ...(updateProfileDto.profilePhotoUrl !== undefined && { profilePhotoUrl: updateProfileDto.profilePhotoUrl }),
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async searchUsers(query?: string, exclude?: string) {
    const excludeIds = exclude ? exclude.split(',').filter(Boolean) : [];

    const whereClause: any = {
      ...(excludeIds.length > 0 && {
        userId: { notIn: excludeIds },
      }),
    };

    if (query && query.trim()) {
      const q = query.trim();
      whereClause.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profilePhotoUrl: true,
      },
      take: 20,
      orderBy: { firstName: 'asc' },
    });
  }
}
