import { BillItem, EInvoiceType, Invoice } from '@/utils/types/DataTypes'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Image from 'next/image';

export const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six",
        "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
        "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const getWords = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100)
            return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000)
            return (
                ones[Math.floor(n / 100)] +
                " Hundred" +
                (n % 100 ? " " + getWords(n % 100) : "")
            );
        return "";
    };

    let result = "";

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const hundred = num;

    if (crore) result += getWords(crore) + " Crore ";
    if (lakh) result += getWords(lakh) + " Lakh ";
    if (thousand) result += getWords(thousand) + " Thousand ";
    if (hundred) result += getWords(hundred);

    return result.trim() + " Only";
};

export const mapBillItems = (items: any[]) => {
    return items.map((item, index) => ({
        ...item,
        sr: index + 1,
        amount: Number((item.Qty * item.Rate).toFixed(2))
    }));
};

const InvoiceLayout = ({ billData, billItems, einvoice }: {
    billData: Invoice;
    billItems: BillItem[];
    einvoice?: EInvoiceType;
}) => {

    const mappedBillItems = mapBillItems(billItems);
    const MIN_ROWS = 25;
    const emptyRows = Math.max(0, MIN_ROWS - mappedBillItems.length);

    const columns = [
        { label: "Sr.", key: "sr" },
        { label: "Qty", key: "Qty" },
        { label: "Pack", key: "PACK" },
        { label: "Company", key: "COMPANY" },
        { label: "Particulars", key: "PARTICULARS" },
        { label: "HSN", key: "HSN CODE" },
        { label: "Batch", key: "Batch No." },
        { label: "Exp", key: "Exp." },
        { label: "MRP", key: "MRP." },
        { label: "Rate", key: "Rate" },
        { label: "Disc%", key: "DIS%" },
        { label: "Tax%", key: "Tax" },
        { label: "Amount", key: "amount" },
    ];


    return (
        <div className="w-full max-w-5xl mx-auto bg-white text-black border border-black border-collapse print:border-[0.5px]">

            <section className="w-full grid grid-cols-[40%_20%_40%] p-2">
                <div>
                    <h2 className="text-2xl uppercase">Pharma Cube</h2>
                    <p className="text-[8px] uppercase">SHOP NO. 101,102,103,104,106,107,108 PLOT NO. 1, KRISHNA TOWER POCKET-7, SEC-12, DWARKA, NEW DELHI</p>
                    <p className="text-[8px]">Phone : 011-45524850,8178670716, 8920139565</p>
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <p className="underline uppercase">GST INVOICE</p>
                    <Image
                        src="/invoice-logo.png"
                        alt="logo"
                        height={80}
                        width={80}
                    />

                </div>

                <div className="flex flex-col items-end">
                    <p className="text-[8px] uppercase">GST No. : 07AATFP9793N1ZV</p>
                    <div className="flex flex-col items-end">
                        <p className="text-[8px]">PAN : AATFP9793N</p>
                        <p className="text-[8px]">MSME NO.(UAM) - DL10D0009379</p>
                        <p className="text-[8px]">D.L.No. : WLF20B2022DL000560</p>
                        <p className="text-[8px]">E-mail : sales@pharmacube.in, purchase@pharmacube.in</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-[40%_20%_40%] border-t border-black border-collapse print:border-t-[0.5px]">

                <div className='border-r border-black border-collapse print:border-r-[0.5px]'>
                    <div className="p-2 print:p-1">
                        <p className="text-base print:text-[8px] font-bold">{billData?.name}</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.address}</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.address1}</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.address2}</p>
                        <p className="text-[12px] print:text-[8px]">Tel: {billData?.Tel}</p>
                    </div>
                    {einvoice &&
                        <div className="flex border-t border-black border-collapse print:border-t-[0.5px] p-2">
                            {/* <p className="text-[12px] print:text-[8px]">IRN:</p> */}
                            <p className="text-[12px] print:text-[8px] break-all"><span className='font-semibold'>IRN: </span>{einvoice?.Irn}</p>
                        </div>
                    }

                </div>

                <div className="mx-auto my-auto"></div>

                <div className="border-l border-black  border-collapse print:border-l-[0.5px]">
                    <div className="p-2 grid grid-cols-[25%_75%] gap-x-2 print:p-1">
                        <p className="text-sm font-medium print:text-[8px]">Bill No:</p>
                        <p className="text-base font-bold print:text-[8px]">{billData?.["Bill No"]}</p>

                        <p className="text-xs font-medium print:text-[8px]">Date:</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.Dated}</p>

                        <p className="text-xs font-medium print:text-[8px]">GST No:</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.["GST No."]}</p>

                        <p className="text-xs font-medium print:text-[8px]">DL No:</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.DLNO}</p>

                        <p className="text-xs font-medium print:text-[8px]">Tel:</p>
                        <p className="text-[12px] print:text-[8px]">{billData?.DLNO1}</p>

                        <p className="text-xs font-medium print:text-[8px]">PAN:</p>
                        <p className="text-[12px] print:text-[8px]">-</p>
                    </div>
                    {einvoice &&
                        <div className="border-t border-black border-collapse print:border-t-[0.5px] p-2 print:p-1">
                            <div className='grid grid-cols-[25%_75%] gap-x-2'>

                                <p className="text-xs font-medium print:text-[8px]">Ack No:</p>
                                <p className="text-[12px] print:text-[8px]">{einvoice.AckNo}</p>

                                <p className="text-xs font-medium print:text-[8px]">Ack Dt:</p>
                                <p className="text-[12px] print:text-[8px]">{new Date(einvoice.AckDt).toLocaleDateString("en-IN")}</p>

                                <p className="text-xs font-medium print:text-[8px]">EWB No:</p>
                                <p className="text-[12px] print:text-[8px]">{einvoice.EwbNo}</p>

                                <p className="text-xs font-medium print:text-[8px]">EWB Dt:</p>
                                <p className="text-[12px] print:text-[8px]">{new Date(einvoice.EwbDt).toLocaleDateString("en-IN")}</p>

                                <p className="text-xs font-medium print:text-[8px]">EWB Validity:</p>
                                <p className="text-[12px] print:text-[8px]">{new Date(einvoice.EwbValidTill).toLocaleDateString("en-IN")}</p>
                            </div>
                        </div>
                    }
                </div>

            </section>


            <Table className="border-none text-[8px]">
                {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                <TableHeader>
                    <TableRow className="border-t h-0 border-black p-0">
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">Sr.</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">QTY.</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">PACK</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">COMPANY</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">PARTICULARS</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">HSN CODE</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">Batch No.</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">Exp.</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">MRP</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">Rate</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">DIS%</TableHead>
                        <TableHead className="py-1 h-0 border-r border-black print:border-r-[0.5px]">Tax</TableHead>
                        <TableHead className="py-1 h-0">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mappedBillItems.map((item, index) => (
                        <TableRow key={index} className="border-b-0!">
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    className={`
                                    border-r last:border-r-0 py-1 border-black print:border-r-[0.5px]
                                    ${typeof item[col.key] === "number" ? "text-right" : ""}
                                    `}
                                >
                                    {col.key === "sr" ? index + 1 : item[col.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                    {Array.from({ length: emptyRows }).map((_, i) => (
                        <TableRow key={`empty-${i}`} className="border-b-0!">
                            {columns.map((col) => (
                                <TableCell
                                    key={col.key}
                                    className="border-r last:border-r-0 py-1 border-black print:border-r-[0.5px]"
                                >
                                    &nbsp;
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}

                </TableBody>
            </Table>

            <div className="h4"></div>

            <div className="w-full grid grid-cols-[15%_65%_20%] border-t text-nowrap border-black border-collapse print:border-t-[0.5px]">

                <div className="border-r border-black border-collapse print:border-r-[0.5px]">
                    <p className="text-[8px] border-b p-1 border-black border-collapse print:border-b-[0.5px]">No of Items: {billData?.['No Of Items']}</p>
                    <p className="text-[8px] px-1">Total Qty: {mappedBillItems.reduce((sum, item) => sum + item.Qty, 0)}</p>
                    <p className="text-[8px] px-1">Made By: {billData?.["Made By"]}</p>
                    <p className="text-[8px] px-1">Print By: {billData?.["Print By"]}</p>
                    <p className="text-[8px] px-1">Make Time: {billData?.["Make Time"]}</p>
                    <p className="text-[8px] px-1">
                        Print Time: {new Date().toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </p>
                    <p className="text-[8px] border-t border-black print:border-t-[0.5px] text-right px-1 font-bold">Total:</p>
                </div>

                <div className="grid grid-cols-[repeat(8,auto)] ">
                    <p className="text-[8px] p-1 text-right r-border">Gross Amt</p>
                    <p className="text-[8px] p-1 text-right r-border">Scm Amt</p>
                    <p className="text-[8px] p-1 text-right r-border">Disc. Amt</p>
                    <p className="text-[8px] p-1 text-right r-border">Taxable Amt.</p>
                    <p className="text-[8px] p-1 text-right r-border">IGST%</p>
                    <p className="text-[8px] p-1 text-right r-border">CGST Amt</p>
                    <p className="text-[8px] p-1 text-right r-border">SGST Amt</p>
                    <p className="text-[8px] p-1 text-right r-border">IGST Amt</p>


                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">28%</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right rt-border">0.00</p>

                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">18%</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>

                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">12%</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>

                    <p className="text-[8px] px-1 text-right r-border">{billData?.["Gross Amt"]}</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">{billData?.["Disc. Amt"]}</p>
                    <p className="text-[8px] px-1 text-right r-border">{billData?.["Taxable Amt."]}</p>
                    <p className="text-[8px] px-1 text-right r-border">5%</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">{billData?.["Tax Amt"]}</p>

                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>
                    <p className="text-[8px] px-1 text-right r-border">0.00</p>

                    <p className="text-[8px] px-1 text-right font-bold rt-border">{billData?.["Gross Amt"]}</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">{billData?.["Disc. Amt"]}</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">{billData?.["Taxable Amt."]}</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border"></p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">0.00</p>
                    <p className="text-[8px] px-1 text-right font-bold rt-border">{billData?.["Tax Amt"]}</p>
                </div>

                <div className=" grid grid-cols-2 gap-x-2 text-right p-1">
                    <p className="text-[8px] px-1">Net Amount:</p>
                    <p className="text-[8px] px-1">{billData?.["Net Amount"]}</p>
                    <p className="text-[8px] px-1">Round Off:</p>
                    <p className="text-[8px] px-1">{(billData?.["Inv Amt"]! - billData?.["Net Amount"]!).toFixed(2)}</p>
                    <p className="text-[8px] px-1">LESS CN:</p>
                    <p className="text-[8px] px-1">0.00</p>
                    <p className="text-[8px] px-1">Inv Amt:</p>
                    <p className="text-[8px] font-bold px-1">{billData?.["Inv Amt"]}</p>
                </div>
            </div>

            <div className="t-border p-1 flex items-center justify-between">
                <p className="text-[8px] font-bold">Total in Words: {numberToWords(billData?.["Inv Amt"] ?? 0)}</p>
                <p className="text-[8px]">E.&.O.E.</p>
            </div>

            <div className="grid grid-cols-[55%_45%] t-border">
                <div className="p-1">
                    <p className="italic text-[8px] font-bold">Terms & Conditions:- <span className="underline">* NOT VALID FOR INPUT TAX *</span> </p>
                    <p className="text-[8px] font-bold">All disputes are subject to Delhi Jurisdiction.</p>
                    <p className="text-[8px] font-bold">Goods once sold will not be taken back.</p>
                </div>
                <p className="text-right text-xs font-bold m-1">For PHARMA CUBE</p>

                <div className="grid grid-cols-2 p-1 rt-border">
                    <div className="grid grid-cols-[30%_70%]">
                        <p className="text-[8px] font-bold">Bank Name</p>
                        <p className="text-[8px] font-bold">: BANK OF MAHARASHTRA</p>
                        <p className="text-[8px] font-bold">Bank A/C</p>
                        <p className="text-[8px] font-bold">: 60298876014</p>
                        <p className="text-[8px] font-bold">Branch</p>
                        <p className="text-[8px] font-bold">: DWARKA SEC-11</p>
                    </div>
                    <div className="grid grid-cols-[30%_70%]">
                        <p className="text-[8px] font-bold">IFSC CODE</p>
                        <p className="text-[8px] font-bold">: MAHB0001244</p>
                        <p className="text-[8px] font-bold">MICR No</p>
                        <p className="text-[8px] font-bold">:</p>
                    </div>
                </div>

                <p className="m-2 self-end text-[8px] font-bold">
                    (Computer Generated Invoice)
                </p>
            </div>


        </div>
    )
}

export default InvoiceLayout