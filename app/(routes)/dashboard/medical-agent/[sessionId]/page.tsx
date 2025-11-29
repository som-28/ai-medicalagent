'use client';
import Vapi from '@vapi-ai/web';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export type sessionDetail = {
  id: number;
  notes: string;
  sessionId: string;
  report: JSON;
  selectedDoctor: doctorAgent;
  createdOn: string;
}

export type messages = {
  role: string;
  text: string;
}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<sessionDetail | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<any>(null); 
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [messages, setMessages] = useState<messages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
      GetSessionDetails();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!vapiInstance) return;

    const handleSpeechStart = () => {
      setCurrentRole('Assistant');
    };

    const handleSpeechEnd = () => {
      setCurrentRole('User');
    };

    const handleTranscript = (message: any) => {
      if (message.type === 'transcript') {
        const { role, transcriptType, transcript } = message;

        if (transcriptType === 'partial') {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        } else if (transcriptType === 'final') {
          setMessages((prev) => [...prev, { role, text: transcript }]);
          setLiveTranscript("");
          setCurrentRole(null);
        }
      }
    };

    if (typeof vapiInstance.on === 'function') {
      vapiInstance.on('speech-start', handleSpeechStart);
      vapiInstance.on('speech-end', handleSpeechEnd);
      vapiInstance.on('message', handleTranscript);
    }

    return () => {
      if (typeof vapiInstance.off === 'function') {
        vapiInstance.off('speech-start', handleSpeechStart);
        vapiInstance.off('speech-end', handleSpeechEnd);
        vapiInstance.off('message', handleTranscript);
      }
    };
  }, [vapiInstance]);

  const GetSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.get('/api/session-chat?sessionId=' + sessionId);
      
      if (!result.data) {
        throw new Error('Session not found');
      }
      
      setSessionDetail(result.data);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to load session details');
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  }

  const StartCall = () => {
    try {
      if (!process.env.NEXT_PUBLIC_VAPI_API_KEY) {
        toast.error('VAPI API key not configured');
        return;
      }

      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
      setVapiInstance(vapi);

      vapi.start(process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID);

      vapi.on('call-start', () => {
        setCallStarted(true);
        setDuration(0);
        toast.success('Call connected!');

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      });

      vapi.on('call-end', () => {
        setCallStarted(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      });

      vapi.on('error', (error: any) => {
        console.error('VAPI Error:', error);
        toast.error('Call connection error');
        setCallStarted(false);
      });
    } catch (err) {
      console.error('Error starting call:', err);
      toast.error('Failed to start call');
    }
  };

  const endCall = async () => {
    if (!vapiInstance) return;

    try {
      setLoading(true);

      // Remove all event listeners safely BEFORE stopping the call
      if (vapiInstance && typeof vapiInstance.off === 'function') {
        try {
          vapiInstance.off('call-start', () => {});
          vapiInstance.off('call-end', () => {});
          vapiInstance.off('message', () => {});
          vapiInstance.off('speech-start', () => {});
          vapiInstance.off('speech-end', () => {});
          vapiInstance.off('error', () => {});
        } catch (err) {
          console.log('Error removing listeners:', err);
        }
      }

      // Stop the call after removing listeners
      if (vapiInstance && typeof vapiInstance.stop === 'function') {
        vapiInstance.stop();
      }

      setCallStarted(false);
      setVapiInstance(null);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Generate report
      if (messages.length > 0 && sessionDetail) {
        try {
          await axios.post('/api/medical-report', {
            sessionId,
            sessionDetail,
            messages
          });
          toast.success('Medical report generated successfully!');
        } catch (err) {
          console.error('Error generating report:', err);
          toast.error('Failed to generate report');
        }
      }

      router.replace('/dashboard');
    } catch (err) {
      console.error('Error ending call:', err);
      toast.error('Error ending call');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading && !sessionDetail) {
    return (
      <div className='flex min-h-[600px] items-center justify-center rounded-3xl border bg-card'>
        <LoadingSpinner size="lg" text="Loading session details..." />
      </div>
    );
  }

  if (error || !sessionDetail) {
    return (
      <div className='flex min-h-[600px] items-center justify-center rounded-3xl border bg-card'>
        <div className="text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4 inline-block">
            <PhoneOff className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-destructive">
            {error || 'Session not found'}
          </h2>
          <p className="mb-6 text-muted-foreground">Unable to load consultation session</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 pb-8'>
      {sessionDetail && 
        <>
          {/* Top Section - Doctor, Status, Duration in one row */}
          <div className='flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-br from-card to-muted/20 p-6 md:flex-row md:p-8'>
            {/* Doctor Profile */}
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <Image 
                  src={sessionDetail.selectedDoctor.image} 
                  alt={sessionDetail.selectedDoctor.specialist} 
                  width={80} 
                  height={80} 
                  className='h-20 w-20 rounded-full border-4 border-primary/20 object-cover shadow-lg'
                />
                {callStarted && (
                  <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 shadow-lg'>
                    <PhoneCall className='h-3 w-3 text-white' />
                  </div>
                )}
              </div>
              <div>
                <h2 className='text-xl font-bold'>{sessionDetail.selectedDoctor.specialist}</h2>
                <p className='text-sm text-muted-foreground'>AI Medical Voice Agent</p>
              </div>
            </div>

            {/* Status and Duration */}
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-3'>
                <div className={`rounded-full p-2 ${callStarted ? 'bg-green-500/10' : 'bg-muted'}`}>
                  <Circle className={`h-4 w-4 ${callStarted ? 'fill-green-500 text-green-500 animate-pulse' : 'fill-muted-foreground text-muted-foreground'}`} />
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <p className="text-sm font-semibold">
                    {callStarted ? 'Connected' : 'Ready'}
                  </p>
                </div>
              </div>
              
              <div className='rounded-xl bg-muted/50 px-4 py-2'>
                <p className='text-xs text-muted-foreground'>Duration</p>
                <p className='text-lg font-bold tabular-nums'>
                  {formatTime(duration)}
                </p>
              </div>

              {/* Call Button */}
              {!callStarted ? 
                <Button 
                  size="lg"
                  className='gap-2' 
                  onClick={StartCall} 
                  disabled={loading}
                > 
                  <PhoneCall className='h-4 w-4' />  
                  Start Call
                </Button>
              :
                <Button 
                  size="lg"
                  variant='destructive' 
                  className='gap-2'
                  onClick={endCall} 
                  disabled={loading}
                >
                  {loading ? <Loader className='h-4 w-4 animate-spin'/> : <PhoneOff className='h-4 w-4' />} 
                  End Call
                </Button>
              }
            </div>
          </div>

          {/* Conversation Section - No scroll, expands naturally */}
          <div className='rounded-2xl bg-gradient-to-br from-background to-muted/10 shadow-lg'>
            <div className='bg-muted/30 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>Conversation</h3>
                {messages.length > 0 && (
                  <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                    {messages.length} messages
                  </span>
                )}
              </div>
            </div>
            
            <div 
              ref={(el) => {
                if (el && (messages.length > 0 || liveTranscript)) {
                  setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }, 100);
                }
              }}
              className='space-y-4 p-6'
            >
              {messages.length === 0 && !liveTranscript && !callStarted && (
                <div className='flex min-h-[300px] items-center justify-center'>
                  <div className='text-center'>
                    <PhoneCall className='mx-auto mb-3 h-12 w-12 text-muted-foreground/50' />
                    <p className='text-muted-foreground'>
                      Click "Start Call" to begin your consultation
                    </p>
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div 
                  key={`msg-${index}`}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                      msg.role === 'assistant' 
                        ? 'bg-primary/10 text-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className='mb-2 flex items-center gap-2 text-xs font-semibold opacity-80'>
                      {msg.role === 'assistant' ? '👨‍⚕️ Doctor' : '👤 You'}
                    </p>
                    <p className='text-sm leading-relaxed'>{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {liveTranscript && (
                <div className={`flex ${currentRole === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div 
                    className={`max-w-[85%] animate-pulse rounded-2xl border-2 border-primary p-4 shadow-md ${
                      currentRole === 'assistant' 
                        ? 'bg-primary/10 text-foreground' 
                        : 'bg-primary/20 text-foreground'
                    }`}
                  >
                    <p className='mb-2 flex items-center gap-2 text-xs font-semibold text-primary'>
                      {currentRole === 'assistant' ? '👨‍⚕️ Doctor' : '👤 You'}
                      <span className='text-xs font-normal text-muted-foreground'>(speaking...)</span>
                    </p>
                    <p className='text-sm leading-relaxed'>{liveTranscript}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      }
    </div>
  )
}  

export default MedicalVoiceAgent;
