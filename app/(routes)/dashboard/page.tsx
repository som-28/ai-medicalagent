'use client';
import React, { useEffect } from 'react';
import HistoryList from './_components/HistoryList';
import DoctorsAgentlist from './_components/DoctorsAgentlist';
import AddNewSessionDialog from './_components/AddNewSessionDialog';
import ErrorBoundary from '@/components/ErrorBoundary';
import { IconSparkles, IconStethoscope } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function Dashboard() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const payment = searchParams.get('payment');
        const plan = searchParams.get('plan');

        if (payment === 'success' && plan) {
            toast.success(`Successfully upgraded to ${plan} plan! 🎉`, {
                duration: 5000,
                description: 'You now have access to all premium features.',
            });
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard');
        } else if (payment === 'cancelled') {
            toast.error('Payment was cancelled', {
                description: 'You can try again anytime from the pricing page.',
            });
            window.history.replaceState({}, '', '/dashboard');
        }
    }, [searchParams]);

    return (
        <ErrorBoundary>
            <div className='space-y-10'>
                {/* Welcome Header */}
                <div className='rounded-3xl border bg-gradient-to-br from-primary/5 via-primary/10 to-blue-500/5 p-8 md:p-10'>
                    <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
                        <div className='flex-1'>
                            <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
                                <IconSparkles size={14} />
                                AI Healthcare Platform
                            </div>
                            <h1 className='mb-2 text-4xl font-bold'>Welcome Back!</h1>
                            <p className='text-lg text-muted-foreground'>
                                Start a consultation or review your medical history
                            </p>
                        </div>
                        <AddNewSessionDialog />
                    </div>
                </div>

                {/* Recent Consultations */}
                <HistoryList />

                {/* AI Specialists */}
                <DoctorsAgentlist />
            </div>
        </ErrorBoundary>
    )
}

export default Dashboard;