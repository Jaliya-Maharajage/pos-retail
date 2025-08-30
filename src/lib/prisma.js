"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// src/lib/prisma.ts
var client_1 = require("@prisma/client");
exports.prisma = (_a = globalThis.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    log: ["query", "error"],
});
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = exports.prisma;
