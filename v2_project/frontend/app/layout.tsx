import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Al Sakr Online V2 | Industrial AI Command Center',
    description: 'The next generation of industrial spare parts procurement and management.',
};

import { AuthProvider } from './providers';
import { ThemeProvider } from '../components/theme-provider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
