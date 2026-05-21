"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { BillItem } from "@/utils/types/DataTypes";
import fs from "fs"
import path from "path"
import { Readable } from "stream"

export async function uploadFile(file: File) {

    const ext = path.extname(file.name)

    const filename = `IMG-recipt-${Date.now()}${ext}`

    const uploadPath = path.join("/var/www/pc_recipts", filename)

    const stream = Readable.fromWeb(file.stream() as any)

    const writeStream = fs.createWriteStream(uploadPath)

    await new Promise<void>((resolve, reject) => {
        stream.pipe(writeStream)
        stream.on("error", reject)
        writeStream.on("finish", resolve)
    })

    return `/${filename}`
}

export const updateDelivery = async (
    billItems: BillItem[],
    id: string,
    discrepancy: boolean,
    recipt: File | null
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
                status = 8,
                discrepancy = 1,
                delivery = ?,
                recipt = ?
                WHERE id = ?
                `,
                [userId, reciptUrl, id]
            );
        } else {
            await conn.execute(
                `
                UPDATE Salepurchase1
                SET 
                status = 7,
                recipt = ?
                WHERE id = ? 
                `,
                [reciptUrl, id]
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