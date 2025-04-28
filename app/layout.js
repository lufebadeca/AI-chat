import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const metadata = {
  title: "FCA chat",
  description: "Chat para practicar estado y manejo deprops entre elementos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
<body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
