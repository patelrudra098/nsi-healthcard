function required(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  apiUrl: required(
    process.env.NEXT_PUBLIC_API_URL,
    "https://healthcard-api.growithnsi.com/api/v1",
  ),
  appName: "HealthCard by Growith NSI",
  isProd: process.env.NODE_ENV === "production",
} as const;
