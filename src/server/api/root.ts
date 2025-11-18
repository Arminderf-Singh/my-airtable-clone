import { createTRPCRouter } from "~/server/api/trpc";
import { baseRouter } from "./routers/base";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  base: baseRouter,
  // Add other routers here
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;