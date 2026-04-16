"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { SessionUser } from "@/utils/types/DataTypes";

const REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes

type SessionPayload = {
  id: number;
  type: SessionUser["type"];
  lastActivity: number;
  iss: string;
};

export async function refreshSession() {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) return;

  let payload: SessionPayload;

  try {
    payload = jwt.verify(session.value, JWT_SECRET, {
      issuer: "pharmacube",
    }) as SessionPayload;
  } catch {
    cookieStore.delete("session");
    return;
  }

  const now = Date.now();

  if (now - payload.lastActivity < REFRESH_THRESHOLD) return;

  const newToken = jwt.sign(
    {
      id: payload.id,
      type: payload.type,
      lastActivity: now,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
      issuer: "pharmacube",
    }
  );

  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("session", newToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
}