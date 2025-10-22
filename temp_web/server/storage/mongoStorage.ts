/* MongoDB Storage Implementation */

import { IStorage, IUser, IMedicalRecord, IAlert } from './types';
import User from '../models/User';
import MedicalRecord from '../models/MedicalRecord';
import Alert from '../models/Alert';

export class MongoStorage implements IStorage {
  // User operations
  async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user.toObject() as IUser;
  }
  
  async findUserByUsername(username: string): Promise<IUser | null> {
    const user = await User.findOne({ username });
    return user ? (user.toObject() as IUser) : null;
  }
  
  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email });
    return user ? (user.toObject() as IUser) : null;
  }
  
  async findUserById(id: string): Promise<IUser | null> {
    const user = await User.findById(id);
    return user ? (user.toObject() as IUser) : null;
  }
  
  async comparePassword(user: IUser, password: string): Promise<boolean> {
    // Use the Mongoose model's method if available
    const mongoUser = await User.findById(user._id);
    if (mongoUser && typeof mongoUser.comparePassword === 'function') {
      return await mongoUser.comparePassword(password);
    }
    // Fallback to direct bcrypt comparison
    const bcrypt = await import('bcrypt');
    return await bcrypt.compare(password, user.password);
  }
  
  // Medical record operations
  async createRecord(recordData: Omit<IMedicalRecord, '_id' | 'uploadedAt'>): Promise<IMedicalRecord> {
    const record = new MedicalRecord(recordData);
    await record.save();
    return record.toObject() as IMedicalRecord;
  }
  
  async findRecords(query: any): Promise<IMedicalRecord[]> {
    const records = await MedicalRecord.find(query)
      .populate('uploadedBy', 'username hospitalName')
      .sort({ uploadedAt: -1 });
    return records.map(r => r.toObject() as IMedicalRecord);
  }
  
  async findRecordById(id: string): Promise<IMedicalRecord | null> {
    const record = await MedicalRecord.findById(id).populate('uploadedBy', 'username hospitalName');
    return record ? (record.toObject() as IMedicalRecord) : null;
  }
  
  // Alert operations
  async createAlert(alertData: Omit<IAlert, '_id' | 'dateDetected' | 'status'>): Promise<IAlert> {
    const alert = new Alert({
      ...alertData,
      status: 'active',
    });
    await alert.save();
    return alert.toObject() as IAlert;
  }
  
  async findAlerts(query: any): Promise<IAlert[]> {
    const alerts = await Alert.find(query).sort({ dateDetected: -1 });
    return alerts.map(a => a.toObject() as IAlert);
  }
  
  async findAlertById(id: string): Promise<IAlert | null> {
    const alert = await Alert.findById(id);
    return alert ? (alert.toObject() as IAlert) : null;
  }
  
  async updateAlert(id: string, update: Partial<IAlert>): Promise<IAlert | null> {
    const alert = await Alert.findByIdAndUpdate(id, update, { new: true });
    return alert ? (alert.toObject() as IAlert) : null;
  }
  
  // Analytics operations
  async getRecordsCount(): Promise<number> {
    return await MedicalRecord.countDocuments();
  }
  
  async getActiveAlertsCount(): Promise<number> {
    return await Alert.countDocuments({ status: 'active' });
  }
  
  async getTrendsData(days: number, filters?: any): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const matchQuery: any = {
      dateReported: { $gte: cutoffDate },
    };
    
    if (filters?.location) {
      matchQuery.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters?.diseaseType) {
      matchQuery.diseaseType = filters.diseaseType;
    }
    
    const trends = await MedicalRecord.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dateReported' },
          },
          cases: { $sum: '$casesCount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $toDate: '$_id' },
          cases: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);
    
    return trends;
  }
  
  async getHeatmapData(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const records = await MedicalRecord.find({
      dateReported: { $gte: cutoffDate },
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    });
    
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
