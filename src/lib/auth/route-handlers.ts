import "server-only";

import type { NextRequest } from "next/server";

import { hasPermissionCode } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/current-user";
import { handleApiError } from "@/lib/api/error-handler";
import {
  AuthenticationError,
  AuthorizationError,
} from "@/lib/errors";
import type { CurrentUser } from "@/types/auth";

type MaybePromise<T> = T | Promise<T>;

interface RouteContext {
  params?: Promise<Record<string, string | string[]>>;
}

type AuthenticatedContext<TContext extends RouteContext> = TContext & {
  user: CurrentUser;
};

type AuthenticatedRouteHandler<TContext extends RouteContext> = (
  request: NextRequest,
  context: AuthenticatedContext<TContext>,
) => MaybePromise<Response>;

export function withApiAuth<TContext extends RouteContext = RouteContext>(
  handler: AuthenticatedRouteHandler<TContext>,
) {
  return async (request: NextRequest, context: TContext) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new AuthenticationError();
      }

      return await handler(request, {
        ...context,
        user,
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function withApiPermission<TContext extends RouteContext = RouteContext>(
  permission: string | readonly string[],
  handler: AuthenticatedRouteHandler<TContext>,
) {
  return withApiAuth<TContext>(async (request, context) => {
    if (!hasPermissionCode(context.user.permissions, permission)) {
      throw new AuthorizationError();
    }

    return handler(request, context);
  });
}

export const withAuth = withApiAuth;
export const withPermission = withApiPermission;
