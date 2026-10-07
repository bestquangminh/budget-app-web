'use client'
import Logo from "@/components/shared/Logo";
import React from "react";

export default function AuthLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pt-14 pb-8">
                <Logo/>
                <div className="mt-5">
                    {children}
                </div>
            </main>
        </>
    )
}