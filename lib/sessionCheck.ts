"use server"

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { SessionUser } from "@/utils/types/DataTypes";

export async function getCurrentUserSafe() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      issuer: "pharmacube",
    });

    if (typeof decoded === "string") return null;

    if (!decoded.id || !decoded.type) return null;
    
    return {
      id: Number(decoded.id),
      type: decoded.type as SessionUser["type"],
      iss: decoded.iss
    };
  } catch {
    return null;
  }
}