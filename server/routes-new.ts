import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePasswords, generateToken } from "./auth";
import { authMiddleware, requireRole } from "./middleware";
import { randomUUID } from "crypto";
import { query } from "./db/client";
import { seedMaterialTemplates } from "./seed-templates";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed default material templates on startup
  await seedMaterialTemplates();

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // ====== PUBLIC AUTH ROUTES ======
