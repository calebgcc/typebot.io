import { z } from "zod";

export const blockCommentContentSchema = z.string().trim().min(1).max(5000);
