import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const tableRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ baseId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findFirst({
        where: {
          id: input.id,
          base: {
            createdById: ctx.session.user.id,
          },
        },
        include: {
          columns: true,
          records: true,
        },
      });
    }),
});