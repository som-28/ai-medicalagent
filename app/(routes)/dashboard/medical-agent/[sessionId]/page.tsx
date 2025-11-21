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

      // Stop the call first
      if (typeof vapiInstance.stop === 'function') {
        vapiInstance.stop();
      }

      // Remove all event listeners safely
      if (typeof vapiInstance.off === 'function') {
        vapiInstance.off('call-start');
        vapiInstance.off('call-end');
        vapiInstance.off('message');
        vapiInstance.off('speech-start');
        vapiInstance.off('speech-end');
        vapiInstance.off('error');
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
    <div className='overflow-hidden rounded-3xl border bg-gradient-to-b from-card to-muted/20'>
      {/* Header */}
      <div className='border-b bg-card p-4 md:p-6'>
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-3'>
            <div className={`rounded-full p-2 ${callStarted ? 'bg-green-500/10' : 'bg-muted'}`}>
              <Circle className={`h-5 w-5 ${callStarted ? 'fill-green-500 text-green-500 animate-pulse' : 'fill-muted-foreground text-muted-foreground'}`} />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Status</p>
              <p className="font-semibold">
                {callStarted ? 'Connected' : 'Ready to Connect'}
              </p>
            </div>
          </div>
          <div className='rounded-xl bg-muted px-4 py-2 sm:px-6 sm:py-3'>
            <p className='text-sm text-muted-foreground'>Duration</p>
            <p className='text-xl font-bold tabular-nums sm:text-2xl'>
              {formatTime(duration)}
            </p>
          </div>
        </div>
      </div>

      {sessionDetail && 
        <div className='flex flex-col items-center p-4 md:p-8'>
          {/* Doctor Profile */}
          <div className='mb-6 text-center md:mb-8'>
            <div className='relative mb-4 inline-block'>
              <Image 
                src={sessionDetail.selectedDoctor.image} 
                alt={sessionDetail.selectedDoctor.specialist} 
                width={140} 
                height={140} 
                className='h-[100px] w-[100px] rounded-full border-4 border-primary/20 object-cover shadow-xl sm:h-[120px] sm:w-[120px] md:h-[140px] md:w-[140px]'
              />
              {callStarted && (
                <div className='absolute -bottom-2 -right-2 rounded-full bg-green-500 p-2 shadow-lg'>
                  <PhoneCall className='h-4 w-4 text-white sm:h-5 sm:w-5' />
                </div>
              )}
            </div>
            <h2 className='mb-1 text-xl font-bold sm:text-2xl'>{sessionDetail.selectedDoctor.specialist}</h2>
            <p className='text-sm text-muted-foreground sm:text-base'>AI Medical Voice Agent</p>
          </div>

          {/* Conversation Display */}
          <div className='mb-6 w-full md:mb-8'>
            <div className='rounded-2xl border bg-background/50 p-4 backdrop-blur md:p-6'>
              <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className='text-lg font-semibold'>Conversation</h3>
                {messages.length > 0 && (
                  <span className='text-sm text-muted-foreground'>{messages.length} messages</span>
                )}
              </div>
              
              <div className='max-h-[300px] space-y-3 overflow-y-auto pr-2 sm:max-h-[400px]'>
                {messages.length === 0 && !liveTranscript && !callStarted && (
                  <div className='flex min-h-[200px] items-center justify-center'>
                    <div className='text-center'>
                      <PhoneCall className='mx-auto mb-3 h-12 w-12 text-muted-foreground/50' />
                      <p className='text-muted-foreground'>
                        Start the call to begin your consultation
                      </p>
                    </div>
                  </div>
                )}
                
                {messages.slice(-8).map((msg, index) => (
                  <div 
                    key={index} 
                    className={`rounded-2xl p-4 ${
                      msg.role === 'assistant' 
                        ? 'bg-primary/10 ml-8' 
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className='mb-1 text-xs font-semibold text-muted-foreground'>
                      {msg.role === 'assistant' ? '👨‍⚕️ Doctor' : '👤 You'}
                    </p>
                    <p className='text-sm leading-relaxed'>{msg.text}</p>
                  </div>
                ))}
                
                {liveTranscript && (
                  <div className={`animate-pulse rounded-2xl border-2 border-primary p-4 ${
                    currentRole === 'assistant' 
                      ? 'bg-primary/10 ml-8' 
                      : 'bg-muted mr-8'
                  }`}>
                    <p className='mb-1 flex items-center gap-2 text-xs font-semibold text-primary'>
                      {currentRole === 'assistant' ? '👨‍⚕️ Doctor' : '👤 You'}
                      <span className='text-muted-foreground'>(speaking...)</span>
                    </p>
                    <p className='text-sm leading-relaxed'>{liveTranscript}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className='flex w-full justify-center'>
            {!callStarted ? 
              <Button 
                size="lg"
                className='w-full gap-2 text-base sm:w-auto sm:min-w-[200px] sm:text-lg' 
                onClick={StartCall} 
                disabled={loading}
              > 
                <PhoneCall />  
                Start Consultation
              </Button>
            :
              <Button 
                size="lg"
                variant='destructive' 
                className='w-full gap-2 text-base sm:w-auto sm:min-w-[200px] sm:text-lg'
                onClick={endCall} 
                disabled={loading}
              >
                {loading ? <Loader className='animate-spin'/> : <PhoneOff />} 
                End Consultation
              </Button>
            }
          </div>
        </div>
      }
    </div>
  )
}  

export default MedicalVoiceAgent;
