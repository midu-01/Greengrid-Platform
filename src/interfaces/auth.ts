import { UserRole } from '@prisma/client';

export interface JwtPayloadData {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedUser extends JwtPayloadData {
  iat?: number;
  exp?: number;
}
