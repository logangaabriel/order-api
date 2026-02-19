import { UserRole } from '../../user/enum/user-role.enum';

export interface TokenPayloadDto {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
  aud?: string;
  iss?: string;
}