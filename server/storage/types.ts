/* Storage Types */

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: 'hospital' | 'municipal';
  hospitalName?: string;
  location?: string;
  createdAt: Date;
}

export interface IMedicalRecord {
  _id?: string;
  uploadedBy: string;
  fileName: string;
  location: string;
  diseaseType: string;
  dateReported: Date;
  casesCount: number;
  latitude?: number;
  longitude?: number;
  uploadedAt: Date;
}

export interface IAlert {
  _id?: string;
  recordId: string;
  location: string;
  diseaseType: string;
  casesDetected: number;
  expectedCases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  dateDetected: Date;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface IStorage {
  // User operations
  createUser(user: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser>;
  findUserByUsername(username: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  comparePassword(user: IUser, password: string): Promise<boolean>;
  
  // Medical record operations
  createRecord(record: Omit<IMedicalRecord, '_id' | 'uploadedAt'>): Promise<IMedicalRecord>;
  findRecords(query: any): Promise<IMedicalRecord[]>;
  findRecordById(id: string): Promise<IMedicalRecord | null>;
  
  // Alert operations
  createAlert(alert: Omit<IAlert, '_id' | 'dateDetected' | 'status'>): Promise<IAlert>;
  findAlerts(query: any): Promise<IAlert[]>;
  findAlertById(id: string): Promise<IAlert | null>;
  updateAlert(id: string, update: Partial<IAlert>): Promise<IAlert | null>;
  
  // Analytics operations
  getRecordsCount(): Promise<number>;
  getActiveAlertsCount(): Promise<number>;
  getTrendsData(days: number, filters?: any): Promise<any[]>;
  getHeatmapData(days: number): Promise<any[]>;
}
