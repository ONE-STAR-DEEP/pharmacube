"use server";

import db from "@/utils/db/mysqlPool";
import { SessionUser, User } from "@/utils/types/DataTypes";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const loginUser = async (data: User) => {

    const conn = await db.getConnection();
    try {

        const [rows]: any = await conn.execute(
            `
        SELECT
            id,
            name,
            type,
            password,
            active,
            plus
            FROM users
            WHERE mobile = ?
        `,
            [data.identifier]
        );

        if (rows.length === 0) {
            return {
                success: false,
                message: "User not found"
            }
        }

        const user = rows[0]

        if (user.active === 0) {
            return {
                success: false,
                message: "Access Denied!!!"
            }
        }

        if (data.password === user.password) {

            const JWT_SECRET = process.env.JWT_SECRET;

            if (!JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined");
            }

            const token = jwt.sign(
                {
                    id: Number(user.id) as Number,
                    type: user.type as SessionUser["type"],
                    plus: Boolean(user.plus)
                },
                JWT_SECRET!,
                {
                    expiresIn: "1d",
                    issuer: "pharmacube"
                }
            );

            const isProd = process.env.NODE_ENV === "production";

            const cookieStore = await cookies();
            cookieStore.set("session", token, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? "strict" : "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60,
            });

            return {
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    type: user.type,
                    plus: Boolean(user.plus)
                }
            }
        }

        return {
            success: false,
            message: "Invalid Credentials"
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Failed to Authenticate"
        }
    }
    finally {
        if (conn) conn.release();
    }
}