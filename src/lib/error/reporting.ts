type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Centralized error reporting.
 * Logs the error to console and can be extended to integrate services like Sentry.
 */
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorReportOptions = {},
) {
  // Always log to console
  console.error("[Application Error]", error, { context, options });

  // Custom logging or monitoring services can be integrated here
}
