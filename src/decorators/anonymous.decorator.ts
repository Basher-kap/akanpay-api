import { SetMetadata } from '@nestjs/common';

export const IS_ANONYMOUS = 'isAnonymous';
export const Anonymous = () => SetMetadata(IS_ANONYMOUS, true);
