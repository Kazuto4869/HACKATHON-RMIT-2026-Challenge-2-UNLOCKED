export function isAllowedWriteOrigin(request: Request, appOrigin: string): boolean {
  const origin = request.headers.get("origin");
  // NextRequest normalizes loopback URLs to localhost; use the configured public origin.
  return origin === null || origin === appOrigin;
}
