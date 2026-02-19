import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../guards/auth-token.guard';
import { TokenPayloadDto } from '../dto/token-paylod.dto';


export const CurrentUser = createParamDecorator(
  (field: keyof TokenPayloadDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as TokenPayloadDto;

    return field ? user?.[field] : user;
  },
);
