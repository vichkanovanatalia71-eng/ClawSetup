type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };

  if (process.env.NODE_ENV === "production") {
    // JSON structured logging for production
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      JSON.stringify(entry)
    );
  } else {
    // Human-readable for development
    const prefix = { info: "INFO", warn: "WARN", error: "ERROR", debug: "DEBUG" }[level];
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `[${prefix}] ${message}`,
      data ? data : ""
    );
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") log("debug", message, data);
  },
};
