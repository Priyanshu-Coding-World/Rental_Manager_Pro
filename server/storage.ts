import { db } from "./db";
import { 
  users, properties, tenants, leases, payments,
  type User, type InsertUser,
  type Property, type InsertProperty,
  type Tenant, type InsertTenant,
  type Lease, type InsertLease,
  type Payment, type InsertPayment,
  type DashboardStats
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;

  // Tenants
  getTenants(): Promise<Tenant[]>;
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant>;
  deleteTenant(id: number): Promise<void>;

  // Leases
  getLeases(): Promise<Lease[]>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease>;

  // Payments
  getPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;

  // Stats
  getDashboardStats(): Promise<DashboardStats>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(properties.createdAt);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values({
      ...property,
      rentAmount: String(property.rentAmount),
    }).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const values: any = { ...property };
    if (values.rentAmount !== undefined) values.rentAmount = String(values.rentAmount);
    const [updated] = await db.update(properties).set(values).where(eq(properties.id, id)).returning();
    return updated;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async getTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants).orderBy(tenants.createdAt);
  }

  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values(tenant).returning();
    return newTenant;
  }

  async updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant> {
    const [updated] = await db.update(tenants).set(tenant).where(eq(tenants.id, id)).returning();
    return updated;
  }

  async deleteTenant(id: number): Promise<void> {
    await db.delete(tenants).where(eq(tenants.id, id));
  }

  async getLeases(): Promise<Lease[]> {
    return await db.select().from(leases).orderBy(leases.startDate);
  }

  async createLease(lease: InsertLease): Promise<Lease> {
    const [newLease] = await db.insert(leases).values({
      ...lease,
      rentAmount: String(lease.rentAmount),
    }).returning();
    
    // Auto-mark property as occupied
    await db.update(properties)
      .set({ status: 'Occupied' })
      .where(eq(properties.id, lease.propertyId));

    return newLease;
  }

  async updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease> {
    const values: any = { ...lease };
    if (values.rentAmount !== undefined) values.rentAmount = String(values.rentAmount);
    const [updated] = await db.update(leases).set(values).where(eq(leases.id, id)).returning();
    return updated;
  }

  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(payments.paymentDate);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values({
      ...payment,
      amount: String(payment.amount),
    }).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment> {
    const values: any = { ...payment };
    if (values.amount !== undefined) values.amount = String(values.amount);
    const [updated] = await db.update(payments).set(values).where(eq(payments.id, id)).returning();
    return updated;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [propCount] = await db.select({ count: sql<number>`count(*)` }).from(properties);
    const [tenantCount] = await db.select({ count: sql<number>`count(*)` }).from(tenants);
    
    const [income] = await db.select({ 
      total: sql<number>`sum(${payments.amount})` 
    }).from(payments).where(eq(payments.status, 'Paid'));

    const [pending] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(payments).where(eq(payments.status, 'Pending'));

    return {
      totalProperties: Number(propCount?.count || 0),
      totalTenants: Number(tenantCount?.count || 0),
      totalMonthlyIncome: Number(income?.total || 0),
      pendingPayments: Number(pending?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
