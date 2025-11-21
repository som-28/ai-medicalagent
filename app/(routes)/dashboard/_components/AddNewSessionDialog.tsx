'use client'
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function AddNewSessionDialog() {
    const [note, setNote] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent | null>(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const OnClickNext = async() => {
        try {
            setLoading(true);
            setError(null);
            const result = await axios.post('/api/suggest-doctors', {
                notes: note,
            });

            if (result.data && Array.isArray(result.data)) {
                setSuggestedDoctors(result.data);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error suggesting doctors:', err);
            setError('Failed to suggest doctors. Please try again.');
            toast.error('Failed to suggest doctors');
        } finally {
            setLoading(false);
        }
    }

    const onStartConsultation = async() => {
        try {
            setLoading(true);
            setError(null);
            const result = await axios.post('/api/session-chat', {
                notes: note,
                selectedDoctor: selectedDoctor
            });

            if (result.data?.sessionId) {
                toast.success('Consultation started successfully!');
                setOpen(false);
                router.push('/dashboard/medical-agent/' + result.data.sessionId);
            } else {
                throw new Error('Failed to create session');
            }
        } catch (err) {
            console.error('Error starting consultation:', err);
            setError('Failed to start consultation. Please try again.');
            toast.error('Failed to start consultation');
        } finally {
            setLoading(false);
        }
    }

    const handleReset = () => {
        setNote('');
        setSuggestedDoctors([]);
        setSelectedDoctor(null);
        setError(null);
    }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button className='mt-3 rounded-xl px-6'>+ Start New Consultation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-2xl font-bold'>Start New Consultation</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-4">
              {suggestedDoctors.length === 0 ? (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <h2 className="text-lg font-semibold text-foreground">
                      Describe Your Symptoms
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                      Provide details about your health concerns for better specialist recommendations
                    </p>
                  </div>
                  <Textarea 
                    placeholder='E.g., "I have been experiencing headaches for the past week..."' 
                    className='min-h-[200px] rounded-xl resize-none'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={loading}
                  />
                  {error && (
                    <p className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <h2 className="text-lg font-semibold text-foreground">Select a Specialist</h2>
                    <p className='text-sm text-muted-foreground'>
                      Choose the most relevant specialist for your consultation
                    </p>
                  </div>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
                    {suggestedDoctors.map((doctor, index) => (
                      <SuggestedDoctorCard 
                        doctorAgent={doctor} 
                        key={doctor.id || index} 
                        setSelectedDoctor={() => setSelectedDoctor(doctor)}
                        selectedDoctor={selectedDoctor}
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {suggestedDoctors.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={loading}
              className='rounded-xl'
            >
              Back
            </Button>
          )}
          <DialogClose asChild>
            <Button variant='outline' disabled={loading} className='rounded-xl'>Cancel</Button>
          </DialogClose>
          
          {suggestedDoctors.length === 0 ? (
            <Button 
              disabled={!note.trim() || loading} 
              onClick={OnClickNext}
              className='rounded-xl'
            > 
              {loading ? (
                <>Processing <Loader2 className='ml-2 h-4 w-4 animate-spin'/></>
              ) : (
                <>Next <ArrowRight className="ml-2 h-4 w-4"/></>
              )}
            </Button>
          ) : (
            <Button  
              disabled={loading || !selectedDoctor} 
              onClick={onStartConsultation}
              className='rounded-xl'
            >
              {loading ? (
                <>Starting <Loader2 className='ml-2 h-4 w-4 animate-spin'/></>
              ) : (
                <>Start Consultation <ArrowRight className="ml-2 h-4 w-4"/></>
              )}
            </Button>
          )}
        </DialogFooter> 
      </DialogContent>
    </Dialog>
  )
}

export default AddNewSessionDialog