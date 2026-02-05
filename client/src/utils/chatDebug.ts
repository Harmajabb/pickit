/**
 * Chat Debugging & Monitoring Utilities
 *
 * Usage in console:
 * import { chatDebug } from './utils/chatDebug';
 * chatDebug.log('test', { data: 'value' });
 */

declare global {
  interface Window {
    chatDebug: ChatDebugger;
    socketMonitor: SocketMonitor;
  }
}

const isProduction = import.meta.env.PROD;

// Couleurs pour le debugging
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

interface DebugOptions {
  showTimestamp?: boolean;
  showTrace?: boolean;
}

interface LogEntry {
  timestamp: string;
  message: string;
  data?: unknown;
}

class ChatDebugger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private format(
    level: "info" | "warn" | "error" | "debug",
    message: string,
    data?: unknown,
    options: DebugOptions = {},
  ) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: `${colors.cyan}ℹ${colors.reset}`,
      warn: `${colors.yellow}⚠${colors.reset}`,
      error: `${colors.red}✗${colors.reset}`,
      debug: `${colors.blue}🐛${colors.reset}`,
    }[level];

    const timeStr = options.showTimestamp ? `[${timestamp}] ` : "";
    const fullMessage = `${prefix} [Chat] ${timeStr}${message}`;

    return { fullMessage, data };
  }

  log(message: string, data?: unknown, options?: DebugOptions) {
    if (isProduction) return;
    const { fullMessage } = this.format("info", message, data, options);
    console.log(fullMessage, data || "");
    this.addLog(message, data);
  }

  warn(message: string, data?: unknown, options?: DebugOptions) {
    const { fullMessage } = this.format("warn", message, data, options);
    console.warn(fullMessage, data || "");
    this.addLog(`[WARN] ${message}`, data);
  }

  error(message: string, error?: Error | unknown, options?: DebugOptions) {
    const { fullMessage } = this.format("error", message, error, options);
    console.error(fullMessage, error || "");
    this.addLog(`[ERROR] ${message}`, error);
  }

  debug(message: string, data?: unknown, options?: DebugOptions) {
    if (isProduction) return;
    const { fullMessage } = this.format("debug", message, data, {
      ...options,
      showTimestamp: true,
    });
    console.debug(fullMessage, data || "");
  }

  // Get all logs (for debugging)
  getLogs() {
    return this.logs;
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Export logs as JSON
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  private addLog(message: string, data?: unknown) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      message,
      data,
    });

    // Keep only last 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }
}

// Socket monitoring
class SocketMonitor {
  private socketMetrics = {
    messagesReceived: 0,
    messagesSent: 0,
    conversationsLoaded: 0,
    reconnections: 0,
    errors: 0,
  };

  recordMessageReceived() {
    this.socketMetrics.messagesReceived++;
  }

  recordMessageSent() {
    this.socketMetrics.messagesSent++;
  }

  recordConversationLoaded() {
    this.socketMetrics.conversationsLoaded++;
  }

  recordReconnection() {
    this.socketMetrics.reconnections++;
  }

  recordError() {
    this.socketMetrics.errors++;
  }

  getMetrics() {
    return {
      ...this.socketMetrics,
      timestamp: new Date().toISOString(),
    };
  }

  reset() {
    this.socketMetrics = {
      messagesReceived: 0,
      messagesSent: 0,
      conversationsLoaded: 0,
      reconnections: 0,
      errors: 0,
    };
  }

  printMetrics() {
    const metrics = this.getMetrics();
    console.table(metrics);
  }
}

// Export utilities
export const chatDebug = new ChatDebugger();
export const socketMonitor = new SocketMonitor();

// Global window access for debugging in console
if (!isProduction) {
  window.chatDebug = chatDebug;
  window.socketMonitor = socketMonitor;
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string) {
    this.marks.set(label, performance.now());
  }

  end(label: string) {
    const startTime = this.marks.get(label);
    if (!startTime) {
      chatDebug.warn(`Performance mark '${label}' not found`);
      return;
    }

    const duration = performance.now() - startTime;
    chatDebug.log(`${label} took ${duration.toFixed(2)}ms`);
    this.marks.delete(label);

    return duration;
  }
}

export const perfMonitor = new PerformanceMonitor();
