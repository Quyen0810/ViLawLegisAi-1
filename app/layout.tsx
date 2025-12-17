// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// ⬇️ Lấy user ở server qua Supabase SSR client
import { createClient } from "../lib/auth/supabaseSever";

// (tuỳ dự án) provider client để chia sẻ user ở client
import { AuthProvider } from "@/lib/auth/AuthProvider";

// Nút/avatar user (client component) – có thể nhận user từ server
import SupabaseUserIcon from "./chat/components/SupabaseUserIcon";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViLaw - Nền tảng Hạ tầng Pháp lý Số Toàn Dân",
  description:
    "Mỗi công dân – Một trợ lý pháp lý AI. Nền tảng pháp lý số toàn diện, tích hợp AI để hỗ trợ công dân, doanh nghiệp và cơ quan nhà nước trong việc tiếp cận, hiểu và áp dụng pháp luật một cách hiệu quả.",
  keywords:
    "pháp lý, AI, trợ lý pháp lý, văn bản pháp luật, tư vấn pháp luật, ViLaw",
  authors: [{ name: "ViLaw Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a345d",
};

// ⬇️ server component: đọc user rồi render
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* 
          Nếu AuthProvider của bạn hỗ trợ, truyền user ban đầu để client đồng bộ ngay.
          Nếu AuthProvider KHÔNG nhận prop này, bạn có thể bỏ `initialUser={user}` đi.
        */}
        <AuthProvider>
          {/* Hiển thị icon nổi khi đã đăng nhập (client component).
             Truyền user từ server để tránh nhấp nháy khi hydrate. */}
          <SupabaseUserIcon mode="floating" />
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#363636", color: "#fff" },
            success: {
              duration: 3000,
              iconTheme: { primary: "#10B981", secondary: "#fff" },
            },
            error: {
              duration: 5000,
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
