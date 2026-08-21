/**
 * Merges class names into a single clean string.
 */
export type ClassValue = string | number | boolean | undefined | null;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
