import { AIDoctorAgents } from '@/shared/list'
import React from 'react'
import DoctorAgentCard from './DoctorAgentCard'
import { IconStethoscope } from '@tabler/icons-react'

function DoctorsAgentlist() {
  return (
    <div>
        <div className='mb-8'>
            <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'>
                <IconStethoscope size={14} />
                AI Specialists
            </div>
            <h2 className='mb-2 text-3xl font-bold'>Choose Your Specialist</h2>
            <p className='text-lg text-muted-foreground'>
                Connect with expert AI doctors across multiple specialties
            </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {AIDoctorAgents.map((doctor) => (
                <DoctorAgentCard key={doctor.id} doctorAgent={doctor} />
            ))}
        </div>
    </div>
  )
}

export default DoctorsAgentlist