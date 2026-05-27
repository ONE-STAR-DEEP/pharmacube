import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { InvoiceData } from "@/utils/types/DataTypes";

export const fetchDeliveredInvoices = async (
    page: number = 1,
    limit: number = 20,
    search?: string,
    Vtyp?: string
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

        const conditions = ["status = 7"];
        const params: any[] = [];

        if (search) {
            conditions.push(`(Vno LIKE ? OR GSTVno LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        if (Vtyp) {
            conditions.push(`Vtyp = ?`);
            params.push(Vtyp);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        // const params: any[] = [searchTerm, searchTerm, VtypTerm];

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