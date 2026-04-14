"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";

export const fetchDeliveryBoy = async () => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        const [rows]: any = await conn.execute(
            `
            SELECT 
            id,
            name,
            email,
            mobile,
            type,
            created_at
            FROM users
            where type = "rider"
            ORDER BY created_at DESC
        `,
        );

        return {
            success: true,
            data: rows,
        }
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

export const riderSelection = async (
    delivery_boy: string,
    VNo: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await conn.execute(
            `
                UPDATE Salepurchase1
                SET 
                delivery_boy = ?,
                status = 4
                WHERE Vno = ?
                AND Vtyp = 'S1'
                `,
            [delivery_boy, VNo]
        );

        await conn.commit();

        return {
            success: true,
            message: "Delivery boy assigned successfully",
        };
    } catch (error) {
        await conn.rollback();
        console.error(error);

        return {
            success: false,
            message: "Failed to assign Delivery boy",
        };
    } finally {
        conn.release();
    }
};

export const riderAction = async (
    data: {
        VNo: string;
        lat: number;
        lng: number;
        accuracy: number;
        action: string;
    }
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;

    if (!userId || type !== "rider") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        const {VNo, lat, lng, accuracy, action} = data;
        await conn.beginTransaction();

        await conn.execute(
            `
                UPDATE Salepurchase1
                SET
                status = 5
                WHERE Vno = ?
                AND Vtyp = 'S1'
                `,
            [VNo]
        );

        await conn.execute(
            `
            INSERT INTO rider_locations
            (rider_id, invoice_id, lat, lng, accuracy, action)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [userId, VNo, lat, lng, accuracy, action]
        );

        await conn.commit();

        return {
            success: true,
            message: "Delivery boy assigned successfully",
        };
    } catch (error) {
        await conn.rollback();
        console.error(error);

        return {
            success: false,
            message: "Failed to assign Delivery boy",
        };
    } finally {
        conn.release();
    }
};