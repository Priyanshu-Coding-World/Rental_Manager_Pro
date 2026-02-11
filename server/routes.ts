import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  setupAuth(app);

  // Helper to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).send("Unauthorized");
  };

  // Stats
  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Properties
  app.get(api.properties.list.path, requireAuth, async (req, res) => {
    const properties = await storage.getProperties();
    res.json(properties);
  });

  app.post(api.properties.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.properties.create.input.parse(req.body);
      const property = await storage.createProperty(input);
      res.status(201).json(property);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.properties.get.path, requireAuth, async (req, res) => {
    const property = await storage.getProperty(Number(req.params.id));
    if (!property) return res.status(404).json({ message: "Not found" });
    res.json(property);
  });

  app.put(api.properties.update.path, requireAuth, async (req, res) => {
    const input = api.properties.update.input.parse(req.body);
    const property = await storage.updateProperty(Number(req.params.id), input);
    res.json(property);
  });

  app.delete(api.properties.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProperty(Number(req.params.id));
    res.sendStatus(204);
  });

  // Tenants
  app.get(api.tenants.list.path, requireAuth, async (req, res) => {
    const tenants = await storage.getTenants();
    res.json(tenants);
  });

  app.post(api.tenants.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.tenants.create.input.parse(req.body);
      const tenant = await storage.createTenant(input);
      res.status(201).json(tenant);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.tenants.get.path, requireAuth, async (req, res) => {
    const tenant = await storage.getTenant(Number(req.params.id));
    if (!tenant) return res.status(404).json({ message: "Not found" });
    res.json(tenant);
  });

  app.put(api.tenants.update.path, requireAuth, async (req, res) => {
    const input = api.tenants.update.input.parse(req.body);
    const tenant = await storage.updateTenant(Number(req.params.id), input);
    res.json(tenant);
  });

  app.delete(api.tenants.delete.path, requireAuth, async (req, res) => {
    await storage.deleteTenant(Number(req.params.id));
    res.sendStatus(204);
  });

  // Leases
  app.get(api.leases.list.path, requireAuth, async (req, res) => {
    const leases = await storage.getLeases();
    res.json(leases);
  });

  app.post(api.leases.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.leases.create.input.parse(req.body);
      const lease = await storage.createLease(input);
      res.status(201).json(lease);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.leases.update.path, requireAuth, async (req, res) => {
    const input = api.leases.update.input.parse(req.body);
    const lease = await storage.updateLease(Number(req.params.id), input);
    res.json(lease);
  });

  // Payments
  app.get(api.payments.list.path, requireAuth, async (req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });

  app.post(api.payments.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.payments.update.path, requireAuth, async (req, res) => {
    const input = api.payments.update.input.parse(req.body);
    const payment = await storage.updatePayment(Number(req.params.id), input);
    res.json(payment);
  });

  // Seed Data
  if (process.env.NODE_ENV !== 'production') {
    const existingUsers = await storage.getUserByUsername('admin');
    if (!existingUsers) {
      await storage.createUser({
        username: 'admin',
        password: 'password123', // In a real app, hash this! auth.ts handles hashing usually
      });
      console.log('Seeded admin user');
    }
  }

  return httpServer;
}
