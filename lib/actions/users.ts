"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { UserFormData } from "@/utils/types/DataTypes";

export const fetchUserData = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || type !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const conn = await db.getConnection();

  try {
    const offset = (page - 1) * limit;

    const safeLimit = Math.min(100, Number(limit) || 10);
    const safeOffset = Math.max(0, Number(offset) || 0);

    const searchTerm = search ? `%${search}%` : `%`;

    const where = `
      WHERE (
        name LIKE ?
        OR email LIKE ?
        OR mobile LIKE ?
      )
    `;

    const params: any[] = [searchTerm, searchTerm, searchTerm];

    const [rows]: any = await conn.execute(
      `
      SELECT 
        id,
        name,
        email,
        mobile,
        type,
        city,
        state,
        pincode,
        created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
      `,
      params
    );

    const [countResult]: any = await conn.execute(
      `
      SELECT COUNT(*) as total
      FROM users
      ${where}
      `,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    return {
      success: true,
      data: rows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit: safeLimit,
      },
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch data",
    };
  } finally {
    conn.release();
  }
};

export const insertUser = async (data: UserFormData) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || type !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  const conn = await db.getConnection();

  try {

    const address = data.address || null;
    const city = data.city || null;
    const state = data.state || null;
    const pincode = data.pincode || null;
    const email = data.email || null;

    const mobile = data.mobile.replace(/^0+/, "");

    const [existing]: any = await conn.query(
      "SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1",
      [data.email, mobile]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "Email/Mobile already exists",
      };
    }

    const [result]: any = await conn.query(
      `INSERT INTO users 
      (name, email, mobile, type, address, city, state, pincode, password, plus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        email,
        mobile,
        data.type,
        address,
        city,
        state,
        pincode,
        data.password,
        data.plus
      ]
    );

    return {
      success: true,
      message: "User created successfully",
      userId: result.insertId,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to insert user",
    };
  } finally {
    conn.release();
  }
};