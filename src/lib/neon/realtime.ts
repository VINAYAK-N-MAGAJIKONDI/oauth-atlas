export function getNeonRealtimeStatus(): {
  configured: boolean;
  realtimeUrl?: string;
  hasSecret: boolean;
} {
  const realtimeUrl = process.env.NEON_REALTIME_URL;
  const secret = process.env.NEON_REALTIME_SECRET;

  return {
    configured: Boolean(realtimeUrl && secret),
    realtimeUrl: realtimeUrl || undefined,
    hasSecret: Boolean(secret && secret.length > 0),
  };
}
