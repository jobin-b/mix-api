interface requestResponse {
  success?: boolean;
  error?: string;
}

import { Request } from "express";

declare module "express" {
  interface Request {
    accessToken?: string;
  }
}
