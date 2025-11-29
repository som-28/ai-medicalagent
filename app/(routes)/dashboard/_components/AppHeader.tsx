'use client';
import React from "react";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconHistory, IconUserCircle, IconCurrencyDollar, IconSparkles } from "@tabler/icons-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function AppHeader() {
    const pathname = usePathname();
    const { user } = useUser();
    const isPremium = user?.publicMetadata?.isPremium === true;

    const navItems = [
        { href: '/dashboard', label: 'Home', icon: IconHome },
        { href: '/pricing', label: 'Pricing', icon: IconCurrencyDollar },
        { href: '/history', label: 'History', icon: IconHistory },
        { href: '/profile', label: 'Profile', icon: IconUserCircle },
    ];

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-0.5 md:px-10 lg:px-20 xl:px-40">
                <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <Image src={'/logobg.png'} alt='logo' width={100} height={26} />
                </Link>
                
                <div className='flex items-center gap-2 md:gap-6'>
                    {isPremium && (
                        <div className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-blue-600 px-3 py-1.5 text-xs font-semibold text-white md:flex">
                            <IconSparkles size={14} />
                            Premium
                        </div>
                    )}
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link 
                                key={item.href}
                                href={item.href}
                                className={`hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex ${
                                    isActive 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                    <ThemeToggle />
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    )
}
export default AppHeader;

