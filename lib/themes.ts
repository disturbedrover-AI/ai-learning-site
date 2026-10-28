/**
 * The list of themes shown in the theme switcher.
 * Each `id` must match a [data-theme="id"] block in app/themes.css.
 * To add a theme: add its CSS block there, then one line here.
 */
export const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "midnight", label: "Midnight Blue" },
  { id: "sand", label: "Warm Sand" },
  { id: "mist", label: "Mist" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const themeIds: string[] = themes.map((t) => t.id);

/** Used on a first visit, before the user has picked anything. */
export const defaultTheme = "system";
