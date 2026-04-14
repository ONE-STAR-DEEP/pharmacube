export interface Invoice {
  id: string;
  name: string;
  address: string;
  address1: string;
  address2: string;
  Tel: string;
  "GST No.": string;
  DLNO: string;
  DLNO1: string;
  "Bill No": string;
  Dated: string; // you can switch to Date if you parse it
  "No Of Items": number;
  "Made By": string;
  "Print By": string;
  "Make Time": string;
  "Gross Amt": number;
  "Disc. Amt": number;
  "Taxable Amt.": number;
  "Tax Amt": number;
  "Net Amount": number;
  "Inv Amt": number;
  discrepancy: string
}

export type BillItem = {
  id: string;
  Qty: number;
  PACK: string;
  COMPANY: string;
  PARTICULARS: string;
  "HSN CODE": string;
  "Batch No.": string;
  "Exp.": string;
  "MRP.": string;   
  Rate: string; 
  "DIS%": string;
  Tax: string;
  old_Qty?: number
};

export type SessionUser = {
  id: number
  type: string
  iss: string
}

export type User = {
  identifier: string;
  password: string;
};

export type UserFormData = {
  name: string;
  email: string;
  mobile: string;
  type: "admin" | "warehouse" | "checker" | "reviewer" | "rider" | "delivery";
  address: string;
  city: string;
  state: string;
  pincode: string;
  password: string;
};

export type UserData = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  type: "admin" | "warehouse" | "checker" | "reviewer" | "rider" | "delivery";
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  password: string;
  created_at: string; // ISO date string
};

export interface InvoiceData {
  id: number;
  Acno: number;
  Vno: string;
  GSTVno: string;
  Vdt: string;        // ISO date string
  Vtyp: string;
  partyName: string;
  NoOfItem: number;
  Uid: string;
  Ouid: string;
  mTime: string;      // e.g. " 5:51PM"
  Amt01: string;      // numeric but stored as string
  disamtit: string;   // negative string
  Taxamt: string;
  Rndamt: string;
  inserted_at: string; // ISO date string
}

export type DeliveryBoy = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  type: "rider"; 
  created_at: string; 
};