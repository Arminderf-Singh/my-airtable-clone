import { appRouter, type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { createCallerFactory } from "~/server/api/trpc";

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
const createCaller = createCallerFactory(appRouter);

export async function api() {
  const context = await createTRPCContext();
  return createCaller(context);
}