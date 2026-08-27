import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  test: publicProcedure
  .meta({openapi: { method: "GET", path: "/test" }})
    .input(z.object({ name: z.string().min(2).max(100), email: z.email() })) 
    .output(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      return { message: `Hello Mr/Ms. ${input.name} (${input.email})!` };
    }),

});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
