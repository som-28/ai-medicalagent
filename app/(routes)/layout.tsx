'use client';
import React from 'react';
import AppHeader from './dashboard/_components/AppHeader';
import ErrorBoundary from '@/components/ErrorBoundary';

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                <AppHeader />
                <div className='px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 py-6 md:py-10'>
                    {children}
                </div>
            </div>
        </ErrorBoundary>
    )
}

export default DashboardLayout;