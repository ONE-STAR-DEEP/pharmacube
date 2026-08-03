"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { UserData, UserFormData } from "@/utils/types/DataTypes";

export const fetchUserData = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || (type !== "admin" && type !== "user")) {
    return { success: false, message: "Unauthorized" };
  }

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

    const [rows]: any = await db.execute(
      `
      SELECT 
        id,
        name,
        email,
        mobile,
        type,
        city,
        state,
        active,
        pincode,
        plus,
        created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
      `,
      params
    );

    const [countResult]: any = await db.execute(
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
      data: rows as UserData,
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
  }
};

export const insertUser = async (data: UserFormData) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || type !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {

    const address = data.address || null;
    const city = data.city || null;
    const state = data.state || null;
    const pincode = data.pincode || null;
    const email = data.email || null;

    const mobile = data.mobile.replace(/^0+/, "");

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ? OR mobile = ? LIMIT 1",
      [data.email, mobile]
    );

    if (existing.length > 0) {
      return {
        success: false,
        message: "Email/Mobile already exists",
      };
    }

    const [result]: any = await db.query(
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
  }
};

export const updateUser = async (id: number, data: UserFormData) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || type !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {

    const address = data.address || null;
    const city = data.city || null;
    const state = data.state || null;
    const pincode = data.pincode || null;
    const email = data.email || null;

    const mobile = data.mobile.replace(/^0+/, "");

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: "User doesn't exists",
      };
    }

    const [result]: any = await db.query(
      `UPDATE users SET 
      name = ?,
      email = ?, 
      mobile = ?, 
      type = ?, 
      address = ?, 
      city = ?, 
      state = ?, 
      pincode = ?, 
      password = ?, 
      plus = ?
      WHERE id = ?
      `,
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
        data.plus,
        id
      ]
    );

    return {
      success: true,
      message: "User updated successfully",
      userId: result.insertId,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update user",
    };
  }
};

export const toggleUserState = async (id: number, state: boolean) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || type !== "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return {
        success: false,
        message: "User doesn't exists",
      };
    }

    const [result]: any = await db.query(
      `UPDATE users SET active = ? WHERE id = ?`,
      [
        state, id
      ]
    );

    return {
      success: true,
      message: "User updated successfully",
      userId: result.insertId,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update user",
    };
  }
};

export const fetchUserByID = async (
  id: number
) => {
  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId || (type !== "admin")) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const [rows]: any = await db.execute(
      `
        SELECT 
        id,
        name,
        email,
        mobile,
        type,
        address,
        city,
        state,
        pincode,
        password,
        plus
        FROM users
        WHERE id = ?
      `,
      [id]
    );

    return {
      success: true,
      data: rows[0] as UserData,
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to fetch data",
    };
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {

  const session = await getCurrentUserSafe();

  const userId = session?.id;
  const type = session?.type;

  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const conn = await db.getConnection();

  await conn.beginTransaction();

  try {

    const [check]: any = await conn.execute(
      `
        SELECT 
        id,
        password
        FROM users
        WHERE id = ?
      `,
      [userId]
    );

    if (check.length === 0) {
      await conn.rollback();
      return {
        success: false,
        message: "Failed to Find user."
      }
    }

    if (check[0].password !== currentPassword) {
      await conn.rollback();
      return {
        success: false,
        message: "Current password does not match the stored password."
      }
    }

    if (check[0].password === newPassword) {
      await conn.rollback();
      return {
        success: false,
        message: "New password is same as current Password."
      }
    }

    const [result]: any = await conn.query(
      `UPDATE users SET 
      password = ?
      WHERE id = ?
      `,
      [
        newPassword,
        userId
      ]
    );

    await conn.commit();

    return {
      success: true,
      message: "Password changed successfully"
    };

  } catch (error) {
    await conn.rollback()
    console.log(error)
    return {
      success: false,
      message: "Failed to Change Password."
    }
  } finally {
    if (conn) {
      conn.release()
    }
  }
}