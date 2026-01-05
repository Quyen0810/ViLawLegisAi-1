'use client'
import { SessionProvider } from "next-auth/react"
import { ConfigProvider } from "antd"

export default function NextAuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ConfigProvider wave={{ disabled: true }}>
            <SessionProvider>
                {children}
            </SessionProvider>
        </ConfigProvider>
    );
}
