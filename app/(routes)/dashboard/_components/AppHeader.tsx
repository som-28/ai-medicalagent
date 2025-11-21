'use client';
import React from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconStethoscope } from "@tabler/icons-react";

function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-4 md:px-10 lg:px-20 xl:px-40">
                <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="rounded-xl bg-primary p-2">
                        <Image src={'/logomain.svg'} alt='logo' width={24} height={24} className="invert dark:invert-0" />
                    </div>
                    <span className="text-xl font-bold">EchoDocAI</span>
                </Link>
                
                <div className='flex items-center gap-6'>
                    <Link 
                        href="/dashboard"
                        className={`hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex ${
                            pathname === '/dashboard' 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <IconHome size={18} />
                        Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    )
}
export default AppHeader;

