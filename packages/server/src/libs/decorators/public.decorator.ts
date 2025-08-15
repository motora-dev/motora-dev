import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@guards/google-cloud-auth.guard';

/**
 * Marks an endpoint as public, bypassing authentication
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
