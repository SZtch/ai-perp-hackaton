import { TonConnectProvider } from '@/providers/ton-connect-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ToastProvider } from '@/providers/toast-provider';
import './globals.css';

export const metadata = {
  title: 'SuperAI Perp - AI-Powered Perpetual Futures on TON',
  description: 'Trade BTC, ETH, and TON with leverage up to 20x on TON blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TonConnectProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </TonConnectProvider>
      </body>
    </html>
  );
}