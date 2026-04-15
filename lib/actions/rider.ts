"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { InvoiceData } from "@/utils/types/DataTypes";

const newStatus = {
  "accepted": 4,
  "picked": 5,
  "delivered": 6
};

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
        id: string;
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

        const {id, lat, lng, accuracy, action: action} = data;
        const status = newStatus[action as keyof typeof newStatus];
        
        await conn.beginTransaction();
        
        const [check]: any = await conn.execute(
            `
            SELECT status FROM Salepurchase1
            Where id = ?
            `,
            [id]
        );

        console.log(check)
          
        if(!check[0]){
          await conn.rollback();
          return {
            success: false,
            message: "Invoice not found"
          };
        }

        if(Number(check[0].status) === 6){
            await conn.rollback();
            return {
                success: false,
                message: "Already delivered"
            };
        }

        await conn.execute(
            `
                UPDATE Salepurchase1
                SET
                status = ?
                WHERE id = ?
                `,
            [status, id]
        );

        await conn.execute(
            `
            INSERT INTO rider_locations
            (rider_id, invoice_id, lat, lng, accuracy, action)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [userId, id, lat, lng, accuracy, action]
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

export const fetchInvoicesByRiderID = async (
    page: number = 1,
    limit: number = 20,
    search?: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || type !== "rider" || iss !== "pharmacube") {
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
        status >= 4
        AND status < 6
        AND rider = ?
        AND
            (
            Vno LIKE ?
            OR GSTVno  LIKE ?
            OR Vtyp LIKE ?
            )
        )
        `;

        const params: any[] = [userId, searchTerm, searchTerm, searchTerm];

        const [rows]: any = await conn.execute(
            `
            SELECT 
            sp.*,
            (sp.Amt01 + sp.Taxamt + sp.Rndamt) AS InvAmt,
            acm.name AS partyName
            FROM Salepurchase1 sp
            LEFT JOIN Acm acm ON sp.Acno = acm.code
            ${where}
            ORDER BY sp.inserted_at DESC
            LIMIT ${safeLimit} OFFSET ${safeOffset}
            `,
            params
        );

        const [countResult]: any = await conn.execute(
            `
            SELECT COUNT(*) as total
            FROM Salepurchase1
            ${where}
        `,
            params
        );

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / safeLimit);

        return {
            success: true,
            data: rows as InvoiceData[],
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

export const fetchDeliveredInvoicesByRiderID = async (
    page: number = 1,
    limit: number = 20,
    search?: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || type !== "rider" || iss !== "pharmacube") {
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
        status = 6
        AND rider = ?
        AND
            (
            Vno LIKE ?
            OR GSTVno  LIKE ?
            OR Vtyp LIKE ?
            )
        )
        `;

        const params: any[] = [userId, searchTerm, searchTerm, searchTerm];

        const [rows]: any = await conn.execute(
            `
            SELECT 
            sp.*,
            (sp.Amt01 + sp.Taxamt + sp.Rndamt) AS InvAmt,
            acm.name AS partyName
            FROM Salepurchase1 sp
            LEFT JOIN Acm acm ON sp.Acno = acm.code
            ${where}
            ORDER BY sp.inserted_at DESC
            LIMIT ${safeLimit} OFFSET ${safeOffset}
            `,
            params
        );

        const [countResult]: any = await conn.execute(
            `
            SELECT COUNT(*) as total
            FROM Salepurchase1
            ${where}
        `,
            params
        );

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / safeLimit);

        return {
            success: true,
            data: rows as InvoiceData[],
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