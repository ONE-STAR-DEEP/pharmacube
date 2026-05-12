"use server";

import db from "@/utils/db/mysqlPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { DashboardStat, DashboardStats } from "@/utils/types/DataTypes";


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
            WHERE Vdt >= NOW() - INTERVAL 100 DAY
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


export const dashboardStats2 = async () => {
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
            WHERE DATE(Vdt) =  '2026-02-11';
            `)

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