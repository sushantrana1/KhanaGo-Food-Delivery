import { authorize } from "./authMiddleware.js";

export const adminOnly = authorize("admin");
