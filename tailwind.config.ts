import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
                display: ["var(--font-display)", "Playfair Display", "serif"],
            },
            colors: {
                primary: {
                    50: "#f0f9f9",
                    100: "#d9f0f1",
                    200: "#b7e2e4",
                    500: "#14b8a6",
                    600: "#0d9488",
                    800: "#115e59",
                    900: "#134e4a",
                    foreground: "#ffffff",
                },
                accent: {
                    50: "#fdf8f6",
                    100: "#f2e8e5",
                    500: "#d97706",
                    600: "#b45309",
                },
                neutral: {
                    900: "#1a1a1a",
                    800: "#2d2d2d",
                    700: "#404040",
                    100: "#f5f5f5",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [],
};
export default config;
