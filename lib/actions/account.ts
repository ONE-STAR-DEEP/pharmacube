"use server"

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { InvoiceData, PaymentData } from "@/utils/types/DataTypes";

type Role = "warehouse" | "checker" | "reviewer" | "rider" | "delivery" | "account";

const transitions: Record<Role, { from: number; to: number }> = {
    warehouse: { from: 0, to: 1 },
    checker: { from: 1, to: 2 },
    reviewer: { from: 2, to: 3 },
    rider: { from: 3, to: 4 },
    account: { from: 3, to: 4 },
    delivery: { from: 6, to: 7 },
};

export const fetchAllValidInvoices = async (
    { page = 1,
        limit = 20,
        search,
        Vtyp
    }: {
        page: number;
        limit: number;
        search?: string;
        Vtyp?: string | string[]
    }
) => {
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

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const rule = transitions[type as Role];

        const conditions = [`status > 3`];
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

export const updatePayment = async (data: PaymentData, GSTVno: string, invoiceId: string) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || type !== "account" || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        if (!data.amount) {
            return {
                success: false,
                message: "Provide payment amount!!!"
            }
        }

        await conn.beginTransaction()
        const [check]: any = await conn.query(`
            SELECT (Amt01 + Taxamt + Rndamt) AS InvAmt from Salepurchase1 where id = ?;
            `, [invoiceId]);

        if (!check.length) {
            return {
                success: false,
                message: "No invoice Found"
            }
        }

        const [insert]: any = await conn.query(`
            INSERT INTO payments
            (
            invoice_id,
            GSTVno,
            amount,
            mode,
            remark
            )
            VALUES 
            (?, ?, ?, ?, ?)
            `, [
            invoiceId,
            GSTVno,
            data.amount,
            data.mode,
            data.remark || null
        ])

        const InvAmt = Number(check[0].InvAmt);
        let status;

        if (InvAmt === data.amount) {
            status = 200;
        } else if (InvAmt > data.amount) {
            status = 190;
        } else if (InvAmt < data.amount) {
            status = 210;
        }

        const [update]: any = await conn.query(`
            UPDATE Salepurchase1 set payment = 1, status = ?, account = ? where id = ?
            `,
            [status, userId, invoiceId]
        );

        await conn.commit();

        return {
            success: true,
            message: "Updated Successfully"
        }
    } catch (error) {
        try {
            await conn.rollback();
        } catch { }
        console.log(error)
        return {
            success: false,
            message: "Failed to Update"
        }
    } finally {
        if (conn) conn.release();
    }
}

export const tnxDetails = async (invoiceId: number) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || type !== "account" || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const [rows]: any = await db.query(
            `SELECT * FROM payments where invoice_id = ?`, [invoiceId]
        )

        if (rows.length === 0) {
            return {
                success: false,
                message: "Tnx Not Found!!!"
            }
        }

        return {
            success: true,
            data: rows[0]
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Tnx Not Found!!!"
        }
    }
}