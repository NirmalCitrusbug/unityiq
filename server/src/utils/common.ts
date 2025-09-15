export function getFullName(user?: { firstName?: string; lastName?: string }) {
  if (!user) return "N/A";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A";
}
