export function isObjectBody(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id >= 1 ? id : null;
}

export function validId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

export function validAngkatan(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1900 &&
    value <= new Date().getFullYear() + 10
  );
}

export function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validOptionalEmail(value: unknown): boolean {
  return value === null || value === undefined || value === "" || validEmail(value);
}

export function validRequiredText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

export function validGender(value: unknown): boolean {
  return (
    value === undefined || value === null || value === "" ||
    value === "Laki-laki" || value === "Perempuan"
  );
}

export function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export function validUUID(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
