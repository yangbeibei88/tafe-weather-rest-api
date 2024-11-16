// @deno-types="@types/jsonwebtoken"
import jwt from "jsonwebtoken";

export const signToken = (payload: string | object) =>
  jwt.sign(payload, Deno.env.get("JWT_SECRET") as jwt.Secret, {
    expiresIn: Deno.env.get("JWT_EXPIRES_IN"),
  });

// export const createSendToken =
