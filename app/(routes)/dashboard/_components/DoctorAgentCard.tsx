'use client'
import React, { useState, useContext } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { IconArrowRight, IconLock, IconStethoscope } from '@tabler/icons-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailcontext'

export type doctorAgent = {
    id: number;
    specialist: string;
    description: string;
    image: string;
    agentPrompt: string;
    voiceId?: string;
    assistantId?: string;
    subscriptionRequired?: boolean;
}

type props = {
    doctorAgent: doctorAgent;
}

function DoctorAgentCard({ doctorAgent }: props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { userDetail } = useContext(UserDetailContext);

  const handleClick = async () => {
    // Check if subscription is required and user is not premium
    if (doctorAgent.subscriptionRequired && !userDetail?.isPremium) {
      toast.info('This specialist requires a premium subscription');
      router.push('/pricing');
      return;
    }

    try {
      setLoading(true);
      
      // Create a new session directly
      const result = await axios.post('/api/session-chat', {
        notes: `Consultation with ${doctorAgent.specialist}`,
        selectedDoctor: doctorAgent
      });

      if (result.data) {
        toast.success('Starting consultation...');
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('Failed to start consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl hover:shadow-primary/5'
    >
      {/* Image Section */}
      <div className='relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/5 to-blue-500/5'>
        <Image 
          src={doctorAgent.image}
          alt={doctorAgent.specialist} 
          width={400} 
          height={300} 
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
        />
        
        {/* Premium Badge */}
        {doctorAgent.subscriptionRequired && !userDetail?.isPremium && (
          <div className='absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg'>
            <IconLock size={12} />
            Premium
          </div>
        )}

        {/* Overlay on hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
      </div>

      {/* Content Section */}
      <div className='p-5'>
        <div className='mb-2 flex items-center gap-2'>
          <div className='rounded-lg bg-primary/10 p-2 text-primary'>
            <IconStethoscope size={16} />
          </div>
          <h3 className='font-bold text-lg leading-tight'>{doctorAgent.specialist}</h3>
        </div>
        
        <p className='mb-4 line-clamp-2 text-sm text-muted-foreground'>
          {doctorAgent.description}
        </p>

        <Button 
          className='w-full' 
          variant={(doctorAgent.subscriptionRequired && !userDetail?.isPremium) ? 'outline' : 'default'}
          onClick={handleClick}
          disabled={loading}
          size="sm"
        >
          {doctorAgent.subscriptionRequired && !userDetail?.isPremium ? (
            <>
              <IconLock className='mr-2' size={16} />
              Upgrade to Access
            </>
          ) : (
            <>
              {loading ? 'Starting...' : 'Consult Now'}
              <IconArrowRight className='ml-2' size={16} />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default DoctorAgentCard