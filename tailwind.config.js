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
                sans: ['"SF Pro Text"', 'Inter', 'sans-serif'],
                serif: ['"Playfair Display"', 'Merriweather', 'serif'],
                display: ['"Playfair Display"', 'serif'],
            },
            colors: {
                background: {
                    primary: '#FFFFFF',
                    secondary: '#F2F2F7',
                    tertiary: '#F9F9F9',
                },
                foreground: {
                    primary: '#000000',
                    secondary: '#3C3C43',
                    muted: '#8E8E93',
                },
                brand: {
                    purple: '#7F77F1', // Focus Purple
                    lavender: '#E9E5F5',
                    lime: '#DCE898',
                },
                priority: {
                    high: {
                        bg: '#FADCDD',
                        text: '#8B0000',
                    },
                    medium: {
                        bg: '#FCE3CB',
                        text: '#9C4400',
                    },
                    low: {
                        bg: '#D6E4FF',
                        text: '#003366',
                    },
                },
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
            },
            borderRadius: {
                'card': '24px',
                'inner': '12px',
                'pill': '100px',
            },
            boxShadow: {
                'soft': '0px 4px 20px rgba(0, 0, 0, 0.06)',
                'floating': '0px 8px 30px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
}
