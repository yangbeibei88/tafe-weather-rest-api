// @deno-types="@types/jsonwebtoken"
import jwt from "jsonwebtoken";

// export const signToken = (payload: string | object) =>
//   jwt.sign(payload, Deno.env.get("JWT_SECRET") as jwt.Secret, {
//     expiresIn: Deno.env.get("JWT_EXPIRES_IN"),
//   });
export const signToken = <T extends string | object>(payload: T) =>
  jwt.sign(payload, Deno.env.get("JWT_SECRET") as jwt.Secret, {
    expiresIn: Deno.env.get("JWT_EXPIRES_IN"),
  });

const verifyJwt = (
  token: string,
  secret: jwt.Secret
): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as jwt.JwtPayload);
    });
  });
};

// DECODE JWT token
export const decodeJwt = async (token: string, secret: jwt.Secret) => {
  return await verifyJwt(token, secret);
};
