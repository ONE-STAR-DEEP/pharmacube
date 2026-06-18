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
  discrepancy: number;
  status: number;
  recipt: string;
  remark: string;
}

export type BillItem = {
  id: string;
  Qty: number | string;
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
  old_batch_no?: string
  old_expiry?: string
};

export type SessionUser = {
  id: number
  type: string
  iss: string
  plus: boolean
}

export type User = {
  identifier: string;
  password: string;
};

export type UserFormData = {
  name: string;
  email: string | null;
  mobile: string;
  type: "admin" | "user" | "warehouse" | "warehouse+" | "checker" | "reviewer" | "rider" | "rider+" | "delivery" | "account" | "";
  address: string;
  city: string;
  state: string;
  pincode: string;
  password: string;
  plus: boolean;
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
  active: boolean;
  plus: boolean;
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
  status: number;
  discrepancy?: number;
  payment: boolean;
  urgent: boolean;
  recipt: string;
  InvAmt: string;
}

export interface DiscrepancyInvoiceData {
  id: number;
  sp1_id: number;
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
  status: number;
  discrepancy?: number;
  payment: boolean;
  urgent: boolean;
  recipt: string;
  InvAmt: string;
  marked_at: string;
  found_at: string;
  marked_by: string;
  resolved_by: string;
  warehouse: number;
  checker: number;
  reviewer: number;
  rider: number;
  delivery: number;
  account: number;
  urgent_marked_by: number;
  warehouse_time: string;
  checker_time: string;
  reviewer_time: string;
  delivery_time: string;
  account_time: string;
  urgent_time: string;
}

export type DeliveryBoy = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  type: "rider";
  created_at: string;
};

export type PaymentData = {
  amount: number | null;
  remark: string;
  mode: string;
};

export type DashboardStat = {
  date: string;
  total: number;
  attended: number;
};

type StageStats = {
  user: string
  total: number
  pending: number
  attended: number
}

export type DashboardStats = {
  warehouse: StageStats
  checker: StageStats
  reviewer: StageStats
  rider: StageStats
  delivery: StageStats
  account: StageStats
}

export type EInvoiceType = {
  Vtype: string;
  Vno: number;
  Vdt: string;
  GSTVno: string;
  Acno: number;
  GSTNo: string;
  Name: string;
  Amt: string;
  Amt01: string;
  Taxamt: string;
  CgstAmt: string;
  SgstAmt: string;
  IgstAmt: string;
  CessAmt: string;
  Status: string;
  UploadMsg: string;
  AckNo: string;
  AckDt: string;
  Irn: string;
  SignedInvoice: string;
  SignedQRCode: string;
  EwbNo: string;
  EwbDt: string;
  EwbValidTill: string;
  QrImage: string;
  NOP: number;
  VehicleNo: string;
  TransName: string;
  TransID: string;
  MachineName: string;
  TransDocNo: string | null;
  Uid: string;
  EWayReason: string | null;
  EWayStatus: string | null;
};

export type OperationLog = {
  id: number;
  discrepancy_at: string;
  discrepancy_time: string;
  warehouse_time: string;
  checker_time: string;
  reviewer_time: string;
  delivery_time: string;
  account_time: string;
  urgent_time: string;
  urgent_marked_by: string;

  warehouse_name: string | null;
  warehouse_type: string | null;

  checker_name: string | null;
  checker_type: string | null;

  reviewer_name: string | null;
  reviewer_type: string | null;

  account_name: string | null;
  account_type: string | null;

  rider_name: string | null;
  rider_type: string | null;

  delivery_name: string | null;
  delivery_type: string | null;
}

export type RiderLocationLog = {
  id: number;
  rider_id: number;
  invoice_id: number;
  lat: string;
  lng: string;
  accuracy: string;
  action: "accepted" | "picked" | "delivered";
  created_at: string;
  rider_time: string | null;
};

export type UserActionReport = {
  id: number;
  name: string;
  type: string;

  warehouse: number;
  checker: number;
  reviewer: number;
  rider: number;
  delivery: number;
  account: number;
  urgentMarked: number;
};