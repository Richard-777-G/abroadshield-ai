import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

type SessionUser = { id?: string; email?: string | null; name?: string | null };

type AuthenticatedUser = Awaited<ReturnType<typeof db.user.upsert>>;

/**
 * Resolve the authenticated NextAuth identity to the application's persisted user.
 * Routes should not perform session-to-database identity resolution themselves.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const sessionUserId = sessionUser?.id;
  const email = sessionUser?.email?.trim().toLowerCase();

  if (!sessionUserId && !email) return null;

  if (sessionUserId) {
    return db.user.upsert({
      where: { id: sessionUserId },
      update: {
        name: sessionUser?.name ?? undefined,
        ...(email ? { email } : {}),
      },
      create: {
        id: sessionUserId,
        email: email || `${sessionUserId}@local.invalid`,
        name: sessionUser?.name ?? undefined,
      },
    });
  }

  return db.user.upsert({
    where: { email: email! },
    update: { name: sessionUser?.name ?? undefined },
    create: { email: email!, name: sessionUser?.name ?? undefined },
  });
}

/**
 * Resolve an authenticated identity without creating a missing application user.
 * Use this for read-only endpoints whose contract distinguishes an absent user.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const sessionUserId = sessionUser?.id;
  const email = sessionUser?.email?.trim().toLowerCase();

  if (!sessionUserId && !email) return null;
  if (sessionUserId) {
    const user = await db.user.findUnique({ where: { id: sessionUserId }, select: { id: true } });
    return user?.id ?? null;
  }

  const user = await db.user.findUnique({ where: { email: email! }, select: { id: true } });
  return user?.id ?? null;
}
