import { config } from "@/utils/db/pool";
import { Invoice } from "@/utils/types/DataTypes";
import sql from "mssql";

export async function getData() {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT Acm.name, Acm.address, Acm.address1, Acm.address2,
             Acm.telephone as 'Tel',
             Acm.GSTNo as 'GST No.',
             Acm.DLNO, Acm.DLNO1,
             Salepurchase1.GSTVno AS 'Bill No',
             CONVERT(VARCHAR(10), Salepurchase1.Vdt, 103) AS 'Dated',
             Salepurchase1.NoOfItem as 'No Of Items',
             Salepurchase1.Uid as 'Made By',
             Salepurchase1.Ouid as 'Print By',
             Salepurchase1.mTime as 'Make Time',
             Salepurchase1.Amt01 + Salepurchase1.disamtit as 'Gross Amt',
             Salepurchase1.disamtit as 'Disc. Amt',
             Salepurchase1.Amt01 as 'Taxable Amt.',
             Salepurchase1.Taxamt as 'Tax Amt',
             Salepurchase1.Amt01 + Salepurchase1.Taxamt as 'Net Amount',
             Salepurchase1.Amt01 + Salepurchase1.Taxamt + Salepurchase1.Rndamt as 'Inv Amt'
      FROM Salepurchase1
      INNER JOIN Acm ON Acm.code = Salepurchase1.Acno
      WHERE Salepurchase1.Vtyp='S1'
        AND Salepurchase1.Vdt='2026-01-02 00:00:00'
    `);

    return result.recordset;
  } catch (err) {
    console.error(err);
  }
}

export async function getBillByBillNo(VNo: number) {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT Acm.name, Acm.address, Acm.address1, Acm.address2,
          Acm.telephone as 'Tel',
          Acm.GSTNo as 'GST No.',
          Acm.DLNO, Acm.DLNO1,
          Salepurchase1.GSTVno AS 'Bill No',
          CONVERT(VARCHAR(10), Salepurchase1.Vdt, 103) AS 'Dated',
          Salepurchase1.NoOfItem as 'No Of Items',
          Salepurchase1.Uid as 'Made By',
          Salepurchase1.Ouid as 'Print By',
          Salepurchase1.mTime as 'Make Time',
          Salepurchase1.Amt01 + Salepurchase1.disamtit as 'Gross Amt',
          Salepurchase1.disamtit as 'Disc. Amt',
          Salepurchase1.Amt01 as 'Taxable Amt.',
          Salepurchase1.Taxamt as 'Tax Amt',
          Salepurchase1.Amt01 + Salepurchase1.Taxamt as 'Net Amount',
          Salepurchase1.Amt01 + Salepurchase1.Taxamt + Salepurchase1.Rndamt as 'Inv Amt'
          FROM Salepurchase1
          INNER JOIN Acm ON Acm.code = Salepurchase1.Acno
          WHERE Salepurchase1.Vtyp ='S1'
          AND Salepurchase1.Vno = '${VNo}'
    `);

    return result.recordset[0] as Invoice;
  } catch (err) {
    console.error(err);
  }
}

export async function getInvoiceItems(VNo: number) {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT Salepurchase2.Qty,
             Item.Pack as 'PACK',
             Item.Compname as 'COMPANY',
             Item.name AS 'PARTICULARS',
             Salepurchase2.HSNCode AS 'HSN CODE',
             SalePurchase2.Batch as 'Batch No.',
             SalePurchase2.expiry as 'Exp.',
             SalePurchase2.Mrp as 'MRP.',
             SalePurchase2.Ftrate as 'Rate',
             SalePurchase2.Dis as 'DIS%',
             CASE
                WHEN SalePurchase2.CGST > 0 THEN SalePurchase2.CGST
                WHEN SalePurchase2.SGST > 0 THEN SalePurchase2.SGST
                WHEN SalePurchase2.IGST > 0 THEN SalePurchase2.IGST
                ELSE 0
             END AS Tax
      FROM Salepurchase2
      INNER JOIN Item ON Item.code = SalePurchase2.Itemc
      WHERE SalePurchase2.Vtype='S1'
        AND SalePurchase2.Vno= ${VNo}
      ORDER BY Item.Compname ASC
    `);

    return result.recordset;

  } catch (err) {
    console.error(err);
    return [];
  }
}