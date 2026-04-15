"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { BillItem, Invoice, InvoiceData } from "@/utils/types/DataTypes";


type Role = "warehouse" | "checker" | "reviewer" | "rider" | "delivery"; ;

const transitions: Record<Role, { from: number; to: number }> = {
    warehouse: { from: 0, to: 1 },
    checker: { from: 1, to: 2 },
    reviewer: { from: 2, to: 3 },
    rider: { from: 3, to: 4 },
    delivery: { from: 6, to: 7 },
};

const discrepancyRule: Record<Role, { from: number; to: number }> = {
    warehouse: { from: 0, to: 1 },
    checker: { from: 1, to: 2 },
    reviewer: { from: 10, to: 11 },
    rider: { from: 11, to: 12 },
    delivery: { from: 12, to: 13 },
};

const successMessages: Record<Role, string> = {
    warehouse: "Invoice approved and sent for checking",
    checker: "Invoice fully approved",
    reviewer: "Invoice successfully reviewed",
    rider: "Accepted",
    delivery: "Invoice delivered",
};

export const fetchInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;
    const iss = session?.iss;

    if (!userId || type !== "admin" || iss !== "pharmacube") {
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
        Vno LIKE ?
        OR GSTVno  LIKE ?
        OR Vtyp LIKE ?
      )
    `;

        const params: any[] = [searchTerm, searchTerm, searchTerm];

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
        conn.release();
    }
};

export const fetchInvoiceByVNo = async (
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
                Salepurchase1.status
                FROM Salepurchase1
                INNER JOIN Acm ON Acm.code = Salepurchase1.Acno
                WHERE Salepurchase1.Vtyp = 'S1'
                AND Salepurchase1.Vno = ?
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
        conn.release();
    }
};

export const fetchInvoiceItems = async (
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
            CASE
            WHEN Salepurchase2.CGST > 0 THEN Salepurchase2.CGST
            WHEN Salepurchase2.SGST > 0 THEN Salepurchase2.SGST
            WHEN Salepurchase2.IGST > 0 THEN Salepurchase2.IGST
            ELSE 0
            END AS 'Tax'
            FROM Salepurchase2
            INNER JOIN Item ON Item.code = Salepurchase2.Itemc
            WHERE Salepurchase2.Vtype = 'S1'
            AND Salepurchase2.Vno = ?
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
        conn.release();
    }
};

export const fetchPendingInvoices = async (
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

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const rule = transitions[type as Role];

        const params: any[] = [rule.from, searchTerm, searchTerm, searchTerm];

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
        conn.release();
    }
};

export const fetchAllValidInvoices = async (
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
        status >= ?
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

        const rule = transitions[type as Role];

        const params: any[] = [rule.to, searchTerm, searchTerm, searchTerm];

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

export const approveInvoice = async (Vno: string) => {

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
            Vtyp = "S1"
            AND Vno = ?
            `,
            [Vno]
        );

        const data = rows[0]

        if (!data) {
            return { success: false, message: "Invoice not found or may have been removed" };
        }

        const status = Number(data.status);

        if (!type || !(type in transitions)) {
            return { success: false, message: "Access denied. Please log in with valid permissions" };
        }

        const rule = transitions[type as Role];

        if (status === rule.to) {
            return { success: false, message: "Invoice is already approved at this stage" };
        }

        if (status !== rule.from) {
            return {
                success: false,
                message: "You are not allowed to approve this invoice at its current stage"
            };
        }

        await conn.execute(
            `
            UPDATE Salepurchase1 
            SET status = ?
            WHERE Vtyp = "S1" AND Vno = ? AND status = ?
            `,
            [rule.to, Vno, rule.from]
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
        conn.release();
    }
}

export const updateInvoiceItems = async (
    billItems: BillItem[],
    VNo: string,
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
                Qty = ?,
                HSNCode = ?
                WHERE id = ?
                `,
                [
                    item.Qty,
                    item["HSN CODE"],
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
                discrepancy = 1
                WHERE Vno = ?
                AND Vtyp = "S1" 
                `,
                [VNo]
            );
        } else {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                status = 2
                WHERE Vno = ?
                AND Vtyp = "S1" 
                `,
                [VNo]
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
        conn.release();
    }
};

export const discrepancyAction = async (
    billItems: BillItem[],
    discrepancy: boolean,
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

        for (const item of billItems) {
            await conn.execute(
                `
                UPDATE Salepurchase2
                SET 
                old_Qty = IF(old_Qty IS NULL, Qty, old_Qty),
                Qty = ?,
                HSNCode = ?
                WHERE id = ?
                `,
                [
                    item.Qty,
                    item["HSN CODE"],
                    item.id,
                ]
            );
        }

        if (discrepancy) {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                discrepancy = 1,
                status = 2
                WHERE Vno = ?
                AND Vtyp = "S1" 
                `,
                [VNo]
            );
        } else {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET
                status = 3
                WHERE Vno = ?
                AND Vtyp = "S1" 
                `,
                [status!, VNo]
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
        conn.release();
    }
};