"use server"

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { InvoiceData, OperationLog, RiderLocationLog } from "@/utils/types/DataTypes";

export const fetchInvoices = async ({
    page = 1,
    limit = 20,
    search,
    Vtyp,
    status,
    startDate,
    endDate
}: {
    page: number;
    limit: number;
    search?: string;
    Vtyp?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
}
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const offset = (page - 1) * limit;

        const safeLimit = Math.min(100, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);

        const conditions = ["status != 7"];
        const params: any[] = [];

        if (search) {

            if (Number(search)) {
                conditions.push(`(Vno LIKE ?)`);
                params.push(`%${search}%`);
            }
            else {
                const [parties]: any = await conn.execute(
                    `SELECT code FROM Acm WHERE name LIKE ?`,
                    [`${search}%`]
                );

                const partyCodes = parties.map((party: any) => party.code);

                if (partyCodes.length > 0) {
                    conditions.push(
                        `Acno IN (${partyCodes.map(() => "?").join(",")})`
                    );

                    params.push(...partyCodes);
                }
            }
        }

        if (Vtyp) {
            conditions.push(`Vtyp = ?`);
            params.push(Vtyp);
        }

        if (Number(status) === 7) {
            conditions.push(`discrepancy = 1`);
        }

        if (status && status != 7) {
            conditions.push(`status = ?`);
            params.push(status);
        }

        if (startDate && endDate) {
            conditions.push(`Vdt >= ? AND Vdt < DATE_ADD(?, INTERVAL 1 DAY)`);
            params.push(startDate, endDate);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const [rows]: any = await conn.execute(
            `
            SELECT 
            sp.*,
            (sp.Amt01 + sp.Taxamt + sp.Rndamt) AS InvAmt,
            acm.name AS partyName
            FROM Salepurchase1 sp
            LEFT JOIN Acm acm ON sp.Acno = acm.code
            ${where}
            ORDER BY sp.urgent DESC, sp.inserted_at DESC
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
        if (conn) conn.release();
    }
};

export const fetchDeliveredInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    Vtyp?: string,
    startDate?: string,
    endDate?: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const offset = (page - 1) * limit;

        const safeLimit = Math.min(100, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);

        const conditions = ["status = 7 OR status = 8"];
        const params: any[] = [];

        if (search) {
            if (Number(search)) {
                conditions.push(`(Vno LIKE ?)`);
                params.push(`%${search}%`);
            }
            else {
                const [parties]: any = await conn.execute(
                    `SELECT code FROM Acm WHERE name LIKE ?`,
                    [`${search}%`]
                );
                const partyCodes = parties.map((party: any) => party.code);
                if (partyCodes.length > 0) {
                    conditions.push(
                        `Acno IN (${partyCodes.map(() => "?").join(",")})`
                    );
                    params.push(...partyCodes);
                }
            }
        }

        if (Vtyp) {
            conditions.push(`Vtyp = ?`);
            params.push(Vtyp);
        }

        if (startDate && endDate) {
            conditions.push(`Vdt >= ? AND Vdt < DATE_ADD(?, INTERVAL 1 DAY)`);
            params.push(startDate, endDate);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const [rows]: any = await conn.execute(
            `
            SELECT 
            sp.*,
            (sp.Amt01 + sp.Taxamt + sp.Rndamt) AS InvAmt,
            acm.name AS partyName
            FROM Salepurchase1 sp
            LEFT JOIN Acm acm ON sp.Acno = acm.code
            ${where}
            ORDER BY sp.urgent DESC, sp.inserted_at DESC
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
        if (conn) conn.release();
    }
};

export const fetchLogs = async (id: number) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const [rows]: any = await db.execute(
            `
        SELECT
            sp.id,
            sp.discrepancy_at,
            
            sp.discrepancy_time,
            sp.warehouse_time,
            sp.checker_time,
            sp.reviewer_time,
            sp.delivery_time,
            sp.account_time,
            sp.urgent_time,
    
            sp.urgent_marked_by,

            uw.name AS warehouse_name,
            uw.type AS warehouse_type,

            uc.name AS checker_name,
            uc.type AS checker_type,

            ur.name AS reviewer_name,
            ur.type AS reviewer_type,

            ua.name AS account_name,
            ua.type AS account_type,

            uri.name AS rider_name,
            uri.type AS rider_type,

            ud.name AS delivery_name,
            ud.type AS delivery_type

        FROM Salepurchase1 sp

        LEFT JOIN users uw ON sp.warehouse = uw.id
        LEFT JOIN users uc ON sp.checker = uc.id
        LEFT JOIN users ur ON sp.reviewer = ur.id
        LEFT JOIN users ua ON sp.account = ua.id
        LEFT JOIN users uri ON sp.rider = uri.id
        LEFT JOIN users ud ON sp.delivery = ud.id

        WHERE sp.id = ?;
        `,
            [id]
        );

        return {
            success: true,
            data: rows[0] as OperationLog
        }
    } catch (error) {
        console.error(error);
    }
}

export const fetchRiderLogs = async (id: number) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const [rows]: any = await db.execute(
            `
    SELECT
        *,
        created_at
    FROM rider_locations
    WHERE invoice_id = ?;
    `,
            [id]
        );

        return {
            success: true,
            data: rows as RiderLocationLog[]
        }
    } catch (error) {
        console.error(error);
    }
}

export const changeStage = async (id: number, stage: number) => {


    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const [rows]: any = await db.execute(
            `
            UPDATE Salepurchase1 set status = ? where id = ?;
            `,
            [stage, id]
        );

        return {
            success: true,
            message: "Invoice Transferred Successfully!"
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Invoice Transfer Failed!"
        }
    }
}