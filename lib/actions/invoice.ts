"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { BillItem, DiscrepancyInvoiceData, EInvoiceType, Invoice, InvoiceData } from "@/utils/types/DataTypes";


type Role = "warehouse" | "checker" | "reviewer" | "rider" | "delivery" | "account" | "fullAccess";

const transitions: Record<Role, { from: number; to: number }> = {
    warehouse: { from: 0, to: 1 },
    checker: { from: 1, to: 2 },
    reviewer: { from: 2, to: 3 },
    fullAccess: { from: 2, to: 3 },
    rider: { from: 3, to: 4 },
    account: { from: 1, to: 4 },
    delivery: { from: 6, to: 7 },
};

const discrepancyRule: Record<Role, { from: number; to: number }> = {
    warehouse: { from: 0, to: 1 },
    checker: { from: 1, to: 2 },
    reviewer: { from: 10, to: 11 },
    fullAccess: { from: 10, to: 11 },
    rider: { from: 11, to: 12 },
    account: { from: 11, to: 12 },
    delivery: { from: 12, to: 13 },
};

const successMessages: Record<Role, string> = {
    warehouse: "Invoice approved and sent for checking",
    checker: "Invoice fully approved",
    reviewer: "Invoice successfully reviewed",
    fullAccess: "Invoice successfully reviewed",
    rider: "Accepted",
    account: "Accepted",
    delivery: "Invoice delivered",
};

export const fetchInvoiceByVNo = async (
    VNo: string,
    Vtyp: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        const [rows]: any = await conn.execute(
            `SELECT 
                Acm.name,
                Acm.address,
                Acm.address1,
                Acm.address2,
                Acm.telephone AS Tel,
                Acm.GSTNo AS 'GST No.',
                Acm.DLNO,
                Acm.DLNO1,
                Salepurchase1.id,
                Salepurchase1.discrepancy,
                Salepurchase1.GSTVno AS 'Bill No',
                DATE_FORMAT(Salepurchase1.Vdt, '%d/%m/%Y') AS Dated,
                Salepurchase1.NoOfItem AS 'No Of Items',
                Salepurchase1.Uid AS 'Made By',
                Salepurchase1.Ouid AS 'Print By',
                Salepurchase1.mTime AS 'Make Time',
                (Salepurchase1.Amt01 + Salepurchase1.disamtit) AS 'Gross Amt',
                Salepurchase1.disamtit AS 'Disc.Amt',
                Salepurchase1.Amt01 AS 'Taxable Amt.',
                Salepurchase1.Taxamt AS 'Tax Amt',
                (Salepurchase1.Amt01 + Salepurchase1.Taxamt) AS 'Net Amount',
                (Salepurchase1.Amt01 + Salepurchase1.Taxamt + Salepurchase1.Rndamt) AS 'Inv Amt',
                Salepurchase1.status,
                Salepurchase1.recipt,
                Salepurchase1.remark
                FROM Salepurchase1
                INNER JOIN Acm ON Acm.code = Salepurchase1.Acno
                WHERE Salepurchase1.Vtyp = ?
                AND Salepurchase1.Vno = ?
                LIMIT 1
                `,
            [Vtyp, VNo]
        );

        return {
            success: true,
            data: rows[0] as Invoice,
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

export const fetchEInvoice = async (
    Vtyp: string,
    VNo: string
) => {

    if (Vtyp === "S1") {
        return {
            success: true,
            data: null,
        };
    }
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.execute(
            `
            SELECT *
            FROM EInvoice
            WHERE Vtype = ?
            AND VNO = ? 
            LIMIT 1;
            `, [Vtyp, VNo]
        );

        return {
            success: true,
            data: rows[0] as EInvoiceType ?? null,
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

export const fetchInvoiceItems = async (
    VNo: string,
    Vtyp: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.execute(
            `SELECT
            Salepurchase2.id,
            Salepurchase2.Qty,
            Item.Pack AS 'PACK',
            Item.Compname AS 'COMPANY',
            Item.name AS 'PARTICULARS',
            Salepurchase2.HSNCode AS 'HSN CODE',
            Salepurchase2.Batch AS 'Batch No.',
            Salepurchase2.expiry AS 'Exp.',
            Salepurchase2.Mrp AS 'MRP.',
            Salepurchase2.Ftrate AS 'Rate',
            Salepurchase2.Dis AS 'DIS%',
            Salepurchase2.old_Qty AS 'old_Qty',
            Salepurchase2.old_batch_no AS 'old_batch_no',
            Salepurchase2.old_expiry AS 'old_expiry',
            CASE
            WHEN Salepurchase2.CGST > 0 THEN Salepurchase2.CGST
            WHEN Salepurchase2.SGST > 0 THEN Salepurchase2.SGST
            WHEN Salepurchase2.IGST > 0 THEN Salepurchase2.IGST
            ELSE 0
            END AS 'Tax'
            FROM Salepurchase2
            INNER JOIN Item ON Item.code = Salepurchase2.Itemc
            WHERE Salepurchase2.Vtype = ?
            AND Salepurchase2.Vno = ?
            ORDER BY Item.name ASC`,
            [Vtyp, VNo]
        );

        return {
            success: true,
            data: rows as BillItem[],
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

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const rule = transitions[type as Role];

        const conditions = [`status = ?`];
        const params: any[] = [rule.from];

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

export const fetchInvoicesToCheck = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    Vtyp?: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;
    const plus = session?.plus;

    if (!userId || iss !== "pharmacube" || !plus) {
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
        status = 1
        AND
            (
            Vno LIKE ?
            OR GSTVno  LIKE ?
            OR Vtyp LIKE ?
            )
        )
    `;

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const params: any[] = [searchTerm, searchTerm, searchTerm];

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

export const fetchDiscrepancyInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string
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

        const searchTerm = search ? `%${search}%` : `%`;

        const where = `
        WHERE (
        status = ?
        AND
            (
            Vno LIKE ?
            OR GSTVno  LIKE ?
            OR Vtyp LIKE ?
            )
        )
    `;

        if (!type || !(type in discrepancyRule)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const rule = discrepancyRule[type as Role];

        const params: any[] = [rule.from, searchTerm, searchTerm, searchTerm];

        const [rows]: any = await conn.execute(
            `
            SELECT 
            sp.*,
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

export const fetchAllValidInvoices = async (
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

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

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

export const approveInvoice = async (Vno: number, Vtyp: string) => {

    const conn = await db.getConnection();

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;


    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const [rows]: any = await conn.execute(
            `
            SELECT 
            status
            FROM Salepurchase1
            WHERE
            Vtyp = '${Vtyp}'
            AND Vno = ?
            `, [Vno]
        );

        const data = rows[0]

        if (!data) {
            return { success: false, message: "Invoice not found or may have been removed" };
        }

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        await conn.execute(
            `
            UPDATE Salepurchase1 
            SET status = ?,
            warehouse = ?,
            warehouse_time = NOW()
            WHERE Vtyp = '${Vtyp}' AND Vno = ? AND status = ?
            `,
            [1, userId, Vno, 0]
        );

        return { success: true, message: successMessages[type as Role], };

    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Something went wrong while approving the invoice"
        }
    }
    finally {
        if (conn) conn.release();
    }
}

export const updateInvoiceItems = async (
    billItems: BillItem[],
    invoiceId: string,
    VNo: string,
    Vtyp: string,
    discrepancy: boolean,
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

        for (const item of billItems) {
            await conn.execute(
                `
                UPDATE Salepurchase2
                SET 
                old_Qty = IF(old_Qty IS NULL, Qty, old_Qty),
                old_batch_no  = IF(old_batch_no  IS NULL, Batch, old_batch_no ),
                old_expiry = IF(old_expiry IS NULL, expiry, old_expiry),
                Qty = ?,
                Batch = ?,
                expiry = ?
                WHERE id = ?
                `,
                [
                    item.Qty,
                    item["Batch No."],
                    item["Exp."],
                    item.id,
                ]
            );
        }

        if (discrepancy) {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                status = 2,
                checker = ?,
                checker_time = NOW(),
                discrepancy = 1,
                discrepancy_at = "check"
                WHERE id = ?
                `,
                [userId, invoiceId]
            );
        } else {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                status = 2,
                checker = ?,
                checker_time = NOW()
                WHERE id = ? 
                `,
                [userId, invoiceId]
            );
        }

        await conn.commit();

        return {
            success: true,
            message: "Invoice items updated successfully",
        };
    } catch (error) {
        await conn.rollback();
        console.error(error);

        return {
            success: false,
            message: "Failed to update invoice items",
        };
    } finally {
        if (conn) conn.release();
    }
};

export const discrepancyAction = async (
    billItems: BillItem[],
    VNo: string,
    Vtyp: string
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

        const [invoiceRes]: any = await conn.execute(
            `SELECT id FROM Salepurchase1 WHERE Vno = ? AND Vtyp = "${Vtyp}"`,
            [VNo]
        );

        if (!invoiceRes.length) {
            throw new Error("Invoice not found");
        }

        const invoiceId = invoiceRes[0].id;

        const [existing]: any = await conn.execute(
            `SELECT id FROM discrepancy_table WHERE sp1_id = ?`,
            [invoiceId]
        );

        if (existing.length) {
            throw new Error("Discrepancy already recorded");
        }

        await conn.execute(
            `
            INSERT INTO discrepancy_table (
            Vno, Vtyp, Vdt, Acno, GSTVno, NoOfItem, Uid, Ouid, mTime, Amt01, disamtit, Taxamt, status, discrepancy, Rndamt, sp1_id, marked_at, found_at, resolved_by
            )
            SELECT
            Vno, Vtyp, Vdt, Acno, GSTVno, NoOfItem, Uid, Ouid, mTime, Amt01, disamtit, Taxamt, 10, discrepancy, Rndamt, id, NOW(), discrepancy_at, ?
            FROM Salepurchase1
            WHERE id = ?
            `,
            [userId, invoiceId]
        );

        for (const item of billItems) {
            await conn.execute(
                `
                INSERT INTO discrepancy_items (
                Vno, Vtype, Vdt, Itemc,
                Qty, HSNCode, Batch, expiry,
                Mrp, Ftrate, Dis, CGST, SGST, IGST,
                invoice_id, old_Qty, old_batch_no, old_expiry
                )
                SELECT
                Vno, Vtype, Vdt, Itemc,
                ?, ?, Batch, expiry,
                Mrp, Ftrate, Dis, CGST, SGST, IGST,
                invoice_id, old_qty, old_batch_no, old_expiry
                FROM Salepurchase2
                WHERE id = ?
            `,
                [
                    item.Qty,
                    item["HSN CODE"],
                    item.id
                ]
            );
        }

        await conn.execute(
            `
            UPDATE Salepurchase1
            SET discrepancy = 2,
            reviewer = ?,
            reviewer_time = NOW(),
            status = 3
            WHERE id = ?
        `,
            [userId, invoiceId]
        );

        await conn.commit();

        return {
            success: true,
            message: "Discrepancy resolved successfully",
        };
    } catch (error) {
        await conn.rollback();
        console.error(error);

        return {
            success: false,
            message: "Failed to record discrepancy",
        };
    } finally {
        if (conn) conn.release();
    }
};

export const fetchDiscrepancies = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    startDate?: string,
    endDate?: string
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

        const conditions = [];
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
            acm.name AS partyName,
            u.name AS marked_by,
            ur.name AS resolved_by,
            CONVERT_TZ(sp.marked_at, '+00:00', '+05:30') AS marked_at
            FROM discrepancy_table sp
            LEFT JOIN Acm acm 
            ON sp.Acno = acm.code
            LEFT JOIN users u ON sp.marked_by = u.id
            LEFT JOIN users ur ON sp.resolved_by = ur.id
            ${where}
            ORDER BY sp.inserted_at DESC
            LIMIT ${safeLimit} OFFSET ${safeOffset}
        `,
            params
        );

        const [countResult]: any = await conn.execute(
            `
                SELECT COUNT(*) as total
                FROM discrepancy_table
                ${where}
            `,
            params
        );

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / safeLimit);

        return {
            success: true,
            data: rows as DiscrepancyInvoiceData[],
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

export const fetchDiscrepancyeByVNo = async (
    VNo: string,
    Vtyp: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        const [rows]: any = await conn.execute(
            `SELECT 
                Acm.name,
                Acm.address,
                Acm.address1,
                Acm.address2,
                Acm.telephone AS Tel,
                Acm.GSTNo AS 'GST No.',
                Acm.DLNO,
                Acm.DLNO1,
                discrepancy_table.id,
                discrepancy_table.discrepancy,
                discrepancy_table.GSTVno AS 'Bill No',
                DATE_FORMAT(discrepancy_table.Vdt, '%d/%m/%Y') AS Dated,
                discrepancy_table.NoOfItem AS 'No Of Items',
                discrepancy_table.Uid AS 'Made By',
                discrepancy_table.Ouid AS 'Print By',
                discrepancy_table.mTime AS 'Make Time',
                (discrepancy_table.Amt01 + discrepancy_table.disamtit) AS 'Gross Amt',
                discrepancy_table.disamtit AS 'Disc.Amt',
                discrepancy_table.Amt01 AS 'Taxable Amt.',
                discrepancy_table.Taxamt AS 'Tax Amt',
                (discrepancy_table.Amt01 + discrepancy_table.Taxamt) AS 'Net Amount',
                (discrepancy_table.Amt01 + discrepancy_table.Taxamt + discrepancy_table.Rndamt) AS 'Inv Amt',
                discrepancy_table.status,
                discrepancy_table.recipt
                FROM discrepancy_table
                INNER JOIN Acm ON Acm.code = discrepancy_table.Acno
                WHERE discrepancy_table.Vtyp = "${Vtyp}"
                AND discrepancy_table.Vno = ?
                LIMIT 1
                `,
            [VNo]
        );

        return {
            success: true,
            data: rows[0] as Invoice,
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

export const fetchDiscrepancyItems = async (
    VNo: string,
    Vtyp: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {
        const [rows]: any = await conn.execute(
            `SELECT
            discrepancy_items.id,
            discrepancy_items.Qty,
            Item.Pack AS 'PACK',
            Item.Compname AS 'COMPANY',
            Item.name AS 'PARTICULARS',
            discrepancy_items.HSNCode AS 'HSN CODE',
            discrepancy_items.Batch AS 'Batch No.',
            discrepancy_items.expiry AS 'Exp.',
            discrepancy_items.Mrp AS 'MRP.',
            discrepancy_items.Ftrate AS 'Rate',
            discrepancy_items.Dis AS 'DIS%',
            discrepancy_items.old_Qty AS 'old_Qty',
            CASE
            WHEN discrepancy_items.CGST > 0 THEN discrepancy_items.CGST
            WHEN discrepancy_items.SGST > 0 THEN discrepancy_items.SGST
            WHEN discrepancy_items.IGST > 0 THEN discrepancy_items.IGST
            ELSE 0
            END AS 'Tax'
            FROM discrepancy_items
            INNER JOIN Item ON Item.code = discrepancy_items.Itemc
            WHERE discrepancy_items.Vtype = "${Vtyp}"
            AND discrepancy_items.Vno = ?
            ORDER BY Item.Compname ASC`,
            [VNo]
        );

        return {
            success: true,
            data: rows as BillItem[],
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

export const markAsUrgent = async (
    id: number
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;

    if (!userId) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        const [check]: any = await conn.execute(
            `
            SELECT status FROM Salepurchase1
            Where id = ?
            `,
            [id]
        );

        if (!check[0]) {
            await conn.rollback();
            return {
                success: false,
                message: "Invoice not found"
            };
        }

        await conn.execute(
            `
                UPDATE Salepurchase1
                SET
                urgent = true,
                urgent_time = NOW(),
                urgent_marked_by = ?
                WHERE id = ?
                `,
            [userId, id]
        );

        await conn.commit();

        return {
            success: true,
            message: "Set to Urgent",
        };
    } catch (error) {
        await conn.rollback();
        console.error(error);

        return {
            success: false,
            message: "Failed to perform action, Try Again",
        };
    } finally {
        if (conn) conn.release();
    }
};

export const approveSelectedInvoice = async (ids: number[]) => {

    const conn = await db.getConnection();

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;


    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    if (!ids.length) {
        return {
            success: false,
            message: "No invoices selected"
        };
    }

    try {

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const placeholders = ids.map(() => "?").join(",");

        await conn.execute(
            `
            UPDATE Salepurchase1
            SET status = ?,
            warehouse = ?,
            warehouse_time = NOW()
            WHERE id IN (${placeholders})
            AND status = ?
            `,
            [1, userId, ...ids, 0]
        );

        return { success: true, message: successMessages[type as Role], };

    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Something went wrong while approving the invoice"
        }
    }
    finally {
        if (conn) conn.release();
    }
}