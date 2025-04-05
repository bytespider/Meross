"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, printf, metadata } = winston_1.default.format;
const capitalizeLevel = winston_1.default.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
})();
const customFormat = printf((info) => `${info.timestamp} ${info.level}: ${info.message} ${JSON.stringify(info.metadata)}`.trim());
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    silent: !process.env.LOG_LEVEL,
    format: combine(capitalizeLevel, timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), customFormat, metadata({ fillExcept: ['message', 'level', 'timestamp'] })),
    transports: [
        new winston_1.default.transports.Console({
            handleExceptions: true,
            format: combine(winston_1.default.format.colorize(), customFormat),
        }),
        new winston_1.default.transports.File({
            level: 'debug',
            filename: 'debug.log',
            format: combine(winston_1.default.format.json()),
        }),
    ],
});
exports.default = logger;
