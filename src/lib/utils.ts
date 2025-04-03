import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class values and merges Tailwind CSS classes
 * efficiently to avoid conflicts. This is useful when conditionally
 * applying classes or merging classes from different sources.
 * 
 * @example
 * // Basic usage
 * <div className={cn("base-class", isActive && "active-class")} />
 * 
 * // With tailwind classes that would conflict
 * <div className={cn("px-2 py-1", isBig && "p-4")} /> // p-4 will override both px-2 and py-1
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to a localized string
 * 
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  }
) {
  return new Intl.DateTimeFormat("en-US", options).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/**
 * Truncates a string to a specified length
 * 
 * @param str - String to truncate
 * @param length - Maximum length
 * @param ending - String to append at the end (default: "...")
 * @returns Truncated string
 */
export function truncate(str: string, length: number, ending = "...") {
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  }
  return str;
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates a random color based on a string
 * Useful for generating user avatar colors
 * 
 * @param str - String to generate color from
 * @returns Hex color code
 */
export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Delays execution for a specified time
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON with a fallback value
 * 
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return fallback;
  }
}
