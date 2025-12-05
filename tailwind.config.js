/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /(bg|text)-(blue|pink|green|purple|orange|red|gray)-(100|200|500|600|700)/,
        }
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                olivia: {
                    primary: '#6366F1',
                    light: '#EEF2FF',
                    dark: '#4338CA',
                },
                annabelle: {
                    primary: '#EC4899',
                    light: '#FDF2F8',
                    dark: '#BE185D',
                },
                shared: {
                    primary: '#8B5CF6',
                    light: '#F5F3FF',
                    dark: '#6D28D9',
                },
                // Urgency colors map to standard tailwind colors, but we can define semantic aliases if needed for utility classes
            }
        },
    },
    plugins: [],
}
