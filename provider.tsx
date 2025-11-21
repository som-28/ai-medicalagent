'use client';
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { UserDetailContext } from "./context/UserDetailcontext";
import LoadingSpinner from "./components/LoadingSpinner";

export type UserDetail = {
    name: string;
    email: string;
    credits: number;
}

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){

    const { user, isLoaded } = useUser();
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            CreateNewUser();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    const CreateNewUser = async() => {
        try {
            setLoading(true);
            setError(null);
            const result = await axios.post("/api/users");
            
            if (result.data) {
                setUserDetail(result.data);
            } else {
                throw new Error('No user data returned');
            }
        } catch (err: any) {
            console.error('Error creating user:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to load user data';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    if (loading && user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size="lg" text="Loading your profile..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center max-w-md p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button 
                        onClick={() => CreateNewUser()} 
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            {children}
        </UserDetailContext.Provider>
    )
}

export default Provider;