// make req.user typed everywhere
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: string; address: string };
  }
}
