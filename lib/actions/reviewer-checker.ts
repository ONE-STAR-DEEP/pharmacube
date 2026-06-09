import db from "@/utils/db/mysqlPool";
import { InvoiceData } from "@/utils/types/DataTypes";
import { getCurrentUserSafe } from "../sessionCheck";

export const fetchPendingInvoices = async ({
    page = 1,
    limit = 20,
    search,
    Vtyp,
}: {
    page?: number;
    limit?: number;
    search?: string;
    Vtyp?: string | string[];
}) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const offset = (page - 1) * limit;

        const safeLimit = Math.min(100, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);


        const conditions = [`status = 1`];
        const params: any[] = [];

        if (search) {
            conditions.push(`(Vno LIKE ? OR GSTVno LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        if (Vtyp) {
            if (Array.isArray(Vtyp)) {
                conditions.push(
                    `Vtyp IN (${Vtyp.map(() => "?").join(", ")})`
                );
                params.push(...Vtyp);
            } else {
                conditions.push(`Vtyp = ?`);
                params.push(Vtyp);
            }
        }

        const where = `WHERE ${conditions.join(" AND ")}`;

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

export const fetchWarehouseInvoices = async ({
    page = 1,
    limit = 20,
    search,
    Vtyp,
}: {
    page?: number;
    limit?: number;
    search?: string;
    Vtyp?: string | string[];
}) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const offset = (page - 1) * limit;

        const safeLimit = Math.min(100, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);


        const conditions = [`status = 0`];
        const params: any[] = [];

        if (search) {
            conditions.push(`(Vno LIKE ? OR GSTVno LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        if (Vtyp) {
            if (Array.isArray(Vtyp)) {
                conditions.push(
                    `Vtyp IN (${Vtyp.map(() => "?").join(", ")})`
                );
                params.push(...Vtyp);
            } else {
                conditions.push(`Vtyp = ?`);
                params.push(Vtyp);
            }
        }

        const where = `WHERE ${conditions.join(" AND ")}`;

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

export const fetchAttendedInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    Vtyp?: string,
    status?: number,
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

        const conditions = [`status >= 1`];
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
            if (Array.isArray(Vtyp)) {
                conditions.push(
                    `Vtyp IN (${Vtyp.map(() => "?").join(", ")})`
                );
                params.push(...Vtyp);
            } else {
                conditions.push(`Vtyp = ?`);
                params.push(Vtyp);
            }
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

        const where = `WHERE ${conditions.join(" AND ")}`;

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
        if (conn) conn.release();
    }
};