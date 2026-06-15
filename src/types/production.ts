export interface User {
  employeeId: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Team Leader' | 'Operator';
}

export interface SubAssemblyRow {
  part: string;
  innova: { received: number; prd: number; pending: number };
  bmc: { received: number; prd: number; pending: number };
  crysta: { received: number; prd: number; pending: number };
}

export interface UnitPartsRow {
  part: string;
  qty1: number;
  qty2: number;
}

export interface EtiosRow {
  part: string;
  hbk: { received: number; prd: number; pending: number };
  sdn: { received: number; prd: number; pending: number };
}

export interface SignOffData {
  tmName: string;
  tmNumber: string;
  designation: string;
  amName: string;
  glName: string;
  remarks: string;
  confirmed: boolean;
  tmSignature?: string;
  amSignature?: string;
  glSignature?: string;
}

export interface ProductionEntry {
  _id?: string;
  id: string;
  date: string;
  shift: "DAY" | "NIGHT";
  status: "draft" | "submitted";
  subAssembly: SubAssemblyRow[];
  unitParts: UnitPartsRow[];
  etios: EtiosRow[];
  signOff: SignOffData | null;
  totals: {
    totalReceived: number;
    totalProduction: number;
    totalPending: number;
  };
}

export interface Target {
  _id: string;
  partName: string;
  lineType: 'SubAssembly' | 'UnitParts' | 'Etios';
  targetQty: number;
  shift: 'DAY' | 'NIGHT';
}

export interface InventoryItem {
  _id: string;
  partName: string;
  lineType: 'SubAssembly' | 'UnitParts' | 'Etios';
  currentStock: number;
  minThreshold: number;
  updatedAt: string;
}

export interface AuditLogItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    employeeId: string;
    role: string;
  };
  action: string;
  collectionName: string;
  documentId: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}

export const SUB_ASSEMBLY_PARTS = [
  "Hood", "RH FR DR", "LH FR DR", "RH RR DR", "LH RR DR",
  "Back DR", "Fender", "Radiator", "Apron", "Dash",
  "Full Cowl", "Cowl Top", "Wheel House", "SM Small"
];

export const UNIT_PARTS = [
  "FSM", "CB", "FT", "Bumper Punching", "All Model", "Laser Cutting"
];

export const ETIOS_PARTS = [
  "Hood", "RH FR DR", "LH FR DR", "RH RR DR", "LH RR DR",
  "Back DR", "Fender", "Radiator", "Apron", "Dash",
  "Full Cowl", "Cowl Top", "Wheel House", "SM Small"
];
