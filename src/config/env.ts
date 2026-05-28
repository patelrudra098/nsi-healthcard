function required(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  apiUrl: required(
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:3001/api/v1",
  ),
  appName: "NSI Family Health Scorecard",
  isProd: process.env.NODE_ENV === "production",
} as const;
