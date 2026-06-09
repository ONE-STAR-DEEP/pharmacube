"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import fs from "fs"
import path from "path"
import { Readable } from "stream"
import { BillItem, InvoiceData } from "@/utils/types/DataTypes";

export async function uploadFile(file: File) {

    const ext = path.extname(file.name)

    const now = new Date()

    // Example: 2026-05
    const monthFolder = `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`

    // Create folder path
    const uploadDir = path.join(
        process.cwd(),
        "..",
        "uploads",
        "recipts",
        monthFolder
    )

    // Create folder if it doesn't exist
    fs.mkdirSync(uploadDir, { recursive: true })

    const filename = `IMG-recipt-${Date.now()}${ext}`

    const uploadPath = path.join(uploadDir, filename)

    const stream = Readable.fromWeb(file.stream() as any)

    const writeStream = fs.createWriteStream(uploadPath)

    await new Promise<void>((resolve, reject) => {
        stream.pipe(writeStream)
        stream.on("error", reject)
        writeStream.on("error", reject)
        writeStream.on("finish", resolve)
    })

    // Return relative URL
    return `/uploads/recipts/${monthFolder}/${filename}`
}

export const updateDelivery = async (
    remark: string | null,
    id: string,
    discrepancy: boolean,
    recipt: File | null,
    billItems: BillItem[]
) => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const iss = session?.iss;

    if (!userId || iss !== "pharmacube") {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    let reciptUrl = recipt ? await uploadFile(recipt) : null;

    try {
        await conn.beginTransaction();

        if (discrepancy) {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET
                status = 8,
                discrepancy = 1,
                delivery = ?,
                recipt = ?,
                discrepancy_at = "delivery",
                discrepancy_time = NOW(), 
                remark = ?,
                delivery_time = NOW()
                WHERE id = ?
                `,
                [userId, reciptUrl, remark, id]
            );

            await conn.execute(
                `
            INSERT INTO discrepancy_table (
            Vno, Vtyp, Vdt, Acno, GSTVno, NoOfItem, Uid, Ouid, mTime, Amt01, disamtit, Taxamt, status, discrepancy, Rndamt, sp1_id
            )
            SELECT
            Vno, Vtyp, Vdt, Acno, GSTVno, NoOfItem, Uid, Ouid, mTime, Amt01, disamtit, Taxamt, 8, 1, Rndamt, id
            FROM Salepurchase1
            WHERE id = ?
            `,
                [id]
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
                Qty, HSNCode, Batch, expiry,
                Mrp, Ftrate, Dis, CGST, SGST, IGST,
                invoice_id, old_qty, old_batch_no, old_expiry
                FROM Salepurchase2
                WHERE id = ?
            `,
                    [
                        item.id
                    ]
                );
            }
        } else {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                status = 7,
                delivery = ?,
                recipt = ?,
                delivery_time = NOW(),
                remark = ?
                WHERE id = ? 
                `,
                [userId, reciptUrl, remark, id]
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

export const fetchAllValidInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    Vtyp?: string,
    status?: number
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
            conditions.push(`(Vno LIKE ? OR GSTVno LIKE ? )`);
            params.push(`%${search}%`, `%${search}%`);
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