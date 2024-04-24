import { z } from "zod";

export const verifySchema = z.object({
    code: z.string().length(6,{message: "code length shold be 6 characters"})
});