/* In-Memory Storage Implementation */

import { IStorage, IUser, IMedicalRecord, IAlert } from './types';
import bcrypt from 'bcrypt';

export class MemoryStorage implements IStorage {
  private users: Map<string, IUser> = new Map();
  private records: Map<string, IMedicalRecord> = new Map();
  private alerts: Map<string, IAlert> = new Map();
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // User operations
  async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user: IUser = {
      ...userData,
      _id: this.generateId(),
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(user._id!, user);
    return user;
  }
  
  async findUserByUsername(username: string): Promise<IUser | null> {
    const user = Array.from(this.users.values()).find(u => u.username === username);
    return user || null;
  }
  
  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    return user || null;
  }
  
  async findUserById(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }
  
  async comparePassword(user: IUser, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }
  
  // Medical record operations
  async createRecord(recordData: Omit<IMedicalRecord, '_id' | 'uploadedAt'>): Promise<IMedicalRecord> {
    const record: IMedicalRecord = {
      ...recordData,
      _id: this.generateId(),
      uploadedAt: new Date(),
    };
    this.records.set(record._id!, record);
    return record;
  }
  
  async findRecords(query: any): Promise<IMedicalRecord[]> {
    let results = Array.from(this.records.values());
    
    if (query.uploadedBy) {
      results = results.filter(r => r.uploadedBy === query.uploadedBy);
    }
    
    if (query.location) {
      results = results.filter(r => r.location.toLowerCase().includes(query.location.toLowerCase()));
    }
    
    if (query.diseaseType) {
      results = results.filter(r => r.diseaseType === query.diseaseType);
    }
    
    return results.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }
  
  async findRecordById(id: string): Promise<IMedicalRecord | null> {
    return this.records.get(id) || null;
  }
  
  // Alert operations
  async createAlert(alertData: Omit<IAlert, '_id' | 'dateDetected' | 'status'>): Promise<IAlert> {
    const alert: IAlert = {
      ...alertData,
      _id: this.generateId(),
      dateDetected: new Date(),
      status: 'active',
    };
    this.alerts.set(alert._id!, alert);
    return alert;
  }
  
  async findAlerts(query: any): Promise<IAlert[]> {
    let results = Array.from(this.alerts.values());
    
    if (query.status) {
      results = results.filter(a => a.status === query.status);
    }
    
    if (query.severity) {
      results = results.filter(a => a.severity === query.severity);
    }
    
    if (query.location) {
      results = results.filter(a => a.location.toLowerCase().includes(query.location.toLowerCase()));
    }
    
    return results.sort((a, b) => b.dateDetected.getTime() - a.dateDetected.getTime());
  }
  
  async findAlertById(id: string): Promise<IAlert | null> {
    return this.alerts.get(id) || null;
  }
  
  async updateAlert(id: string, update: Partial<IAlert>): Promise<IAlert | null> {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    
    const updated = { ...alert, ...update };
    this.alerts.set(id, updated);
    return updated;
  }
  
  // Analytics operations
  async getRecordsCount(): Promise<number> {
    return this.records.size;
  }
  
  async getActiveAlertsCount(): Promise<number> {
    return Array.from(this.alerts.values()).filter(a => a.status === 'active').length;
  }
  
  async getTrendsData(days: number, filters?: any): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let records = Array.from(this.records.values())
      .filter(r => r.dateReported >= cutoffDate);
    
    if (filters?.location) {
      records = records.filter(r => r.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    
    if (filters?.diseaseType) {
      records = records.filter(r => r.diseaseType === filters.diseaseType);
    }
    
    // Group by date
    const groupedByDate = new Map<string, number>();
    records.forEach(record => {
      const dateKey = record.dateReported.toISOString().split('T')[0];
      groupedByDate.set(dateKey, (groupedByDate.get(dateKey) || 0) + record.casesCount);
    });
    
    // Convert to array
    const trends = Array.from(groupedByDate.entries()).map(([date, cases]) => ({
      date: new Date(date),
      cases,
    }));
    
    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async getHeatmapData(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const records = Array.from(this.records.values())
      .filter(r => r.dateReported >= cutoffDate && r.latitude && r.longitude);
    
    return records.map(r => ({
      lat: r.latitude,
      lng: r.longitude,
      location: r.location,
      diseaseType: r.diseaseType,
      intensity: r.casesCount,
      dateReported: r.dateReported,
    }));
  }
}
