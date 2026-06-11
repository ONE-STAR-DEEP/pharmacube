"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { DashboardStat, DashboardStats, UserActionReport } from "@/utils/types/DataTypes";


export const dashboardStats = async () => {
    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;

    if (!userId || (type !== "user" && type !== "admin")) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    try {

        const [data]: any = await conn.query(`
            SELECT
            DATE_FORMAT(Vdt, '%Y-%m-%d') AS date,
            COUNT(*) AS total,
            CAST(SUM(CASE WHEN status > 0 THEN 1 ELSE 0 END) AS UNSIGNED) AS attended
            FROM Salepurchase1
            WHERE Vdt >= NOW() - INTERVAL 200 DAY
            GROUP BY DATE_FORMAT(Vdt, '%Y-%m-%d')
            ORDER BY DATE_FORMAT(Vdt, '%Y-%m-%d') ASC;
            `)

        return {
            success: true,
            data: data as DashboardStat[]
        }

    } catch (error) {

        console.log(error);

        return {
            success: false,
            message: "Something went wrong"
        };

    } finally {
        if (conn) {
            conn.release()
        }
    }

}

export const dashboardStats2 = async (date?: string) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;

    if (!userId || (type !== "user" && type !== "admin")) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    let where = "";
    let params: any[] = [];

    if (date) {
        where = `
            WHERE Vdt >= ?
            AND Vdt < DATE_ADD(?, INTERVAL 1 DAY)
        `;
        params = [date, date];
    } else {
        where = `
            WHERE Vdt >= CURDATE()
            AND Vdt < CURDATE() + INTERVAL 1 DAY
        `;
    }

    try {

        const [data]: any = await conn.query(`
            SELECT
            JSON_OBJECT(
            'user', 'warehouse',
            'total', COUNT(CASE WHEN status >= 0 THEN 1 END),
            'pending', COUNT(CASE WHEN status = 0 THEN 1 END),
            'attended', COUNT(CASE WHEN status > 0 THEN 1 END)
            ) AS warehouse,

            JSON_OBJECT(
            'user', 'checker',
            'total', COUNT(CASE WHEN status >= 1 THEN 1 END),
            'pending', COUNT(CASE WHEN status = 1 THEN 1 END),
            'attended', COUNT(CASE WHEN status > 1 THEN 1 END)
            ) AS checker,

            JSON_OBJECT(
            'user', 'reviewer',
            'total', COUNT(CASE WHEN status >= 2 THEN 1 END),
            'pending', COUNT(CASE WHEN status = 2 THEN 1 END),
            'attended', COUNT(CASE WHEN status > 2 THEN 1 END)
            ) AS reviewer,
             
            JSON_OBJECT(
            'user', 'rider',
            'total', COUNT(CASE WHEN status >= 3 AND status < 9 AND Vtyp = 'S3' THEN 1 END),
            'pending', COUNT(CASE WHEN status = 3 AND status < 9 AND Vtyp = 'S3' THEN 1 END),
            'attended', COUNT(CASE WHEN status > 3 AND status < 9 AND Vtyp = 'S3' THEN 1 END)
            ) AS rider,
             
            JSON_OBJECT(
            'user', 'delivery',
            'total', COUNT(CASE WHEN status >= 4 AND status < 9 AND Vtyp = 'S3' THEN 1 END),
            'pending', COUNT(CASE WHEN status = 4 AND status < 9 AND Vtyp = 'S3' THEN 1 END),
            'attended', COUNT(CASE WHEN status > 4 AND status < 9 AND Vtyp = 'S3' THEN 1 END)
            ) AS delivery,

            JSON_OBJECT(
            'user', 'account',
            'total', COUNT(CASE WHEN status >= 3 AND (status < 9 OR status = 200) AND Vtyp != 'S3' THEN 1 END),
            'pending', COUNT(CASE WHEN status = 3 AND (status < 9 OR status = 200) AND Vtyp != 'S3' THEN 1 END),
            'attended', COUNT(CASE WHEN status = 200 AND Vtyp != 'S3' THEN 1 END)
            ) AS account

            FROM Salepurchase1
                ${where}
            `, params)

        return {
            success: true,
            data: data[0] as DashboardStats
        }

    } catch (error) {

        console.log(error);

        return {
            success: false,
            message: "Something went wrong"
        };

    } finally {
        if (conn) {
            conn.release()
        }
    }

}

export const userActionReport = async (date?: string) => {

    const session = await getCurrentUserSafe();

    const userId = session?.id;
    const type = session?.type;

    if (!userId || (type !== "user" && type !== "admin")) {
        return { success: false, message: "Unauthorized" };
    }

    const conn = await db.getConnection();

    let where = "";
    let params: any[] = [];

    if (date) {
        where = `
            sp.Vdt >= ?
            AND sp.Vdt < DATE_ADD(?, INTERVAL 1 DAY)
        `;
        params = [date, date];
    } else {
        where = `
            sp.Vdt >= CURDATE()
            AND sp.Vdt < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        `;
    }

    try {

        const [data]: any = await conn.query(`
SELECT
    u.id,
    u.name,
    u.type,

    SUM(CASE WHEN sp.warehouse = u.id THEN 1 ELSE 0 END) AS warehouse,
    SUM(CASE WHEN sp.checker = u.id THEN 1 ELSE 0 END) AS checker,
    SUM(CASE WHEN sp.reviewer = u.id THEN 1 ELSE 0 END) AS reviewer,
    SUM(CASE WHEN sp.rider = u.id THEN 1 ELSE 0 END) AS rider,
    SUM(CASE WHEN sp.delivery = u.id THEN 1 ELSE 0 END) AS delivery,
    SUM(CASE WHEN sp.account = u.id THEN 1 ELSE 0 END) AS account,
    SUM(CASE WHEN sp.urgent_marked_by = u.id THEN 1 ELSE 0 END) AS urgentMarked

FROM users u
LEFT JOIN Salepurchase1 sp
    ON u.id IN (
        sp.warehouse,
        sp.checker,
        sp.reviewer,
        sp.rider,
        sp.delivery,
        sp.account,
        sp.urgent_marked_by
    )
    AND ${where}

GROUP BY u.id, u.name, u.type
ORDER BY u.name;
            `, params)

        return {
            success: true,
            data: data as UserActionReport
        }

    } catch (error) {

        console.log(error);

        return {
            success: false,
            message: "Something went wrong"
        };

    } finally {
        if (conn) {
            conn.release()
        }
    }

}