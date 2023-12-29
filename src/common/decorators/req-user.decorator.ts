import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../../auths/dtos/ReqUser.dto';

export const ReqUser = createParamDecorator<string>((data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profilePictureUrl: user.profilePictureUrl,
  } as IUser;
});
