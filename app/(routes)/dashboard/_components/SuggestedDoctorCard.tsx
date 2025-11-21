import React from 'react'
import Image from 'next/image'
import { doctorAgent } from './DoctorAgentCard'
import { IconLock, IconCheck } from '@tabler/icons-react'

type props = {
    doctorAgent: doctorAgent;
    setSelectedDoctor: () => void;
    selectedDoctor: doctorAgent | null;
}

function SuggestedDoctorCard({ doctorAgent, setSelectedDoctor, selectedDoctor }: props) {
  const isSelected = selectedDoctor?.id === doctorAgent?.id;
  const isLocked = doctorAgent?.subscriptionRequired;

  return (
    <button 
      className={`group relative flex flex-col items-center rounded-2xl border-2 p-4 text-left shadow-sm transition-all
        ${isSelected ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md' : 'border-border hover:border-primary/50 hover:shadow-md'}
        ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `} 
      onClick={() => !isLocked && setSelectedDoctor()}
      disabled={isLocked}
      type="button"
    >
      {isSelected && (
        <div className='absolute -right-2 -top-2 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md'>
          <IconCheck size={16} />
        </div>
      )}
      {isLocked && (
        <div className='absolute -right-2 -top-2 rounded-full bg-muted p-1.5 text-muted-foreground shadow-md'>
          <IconLock size={16} />
        </div>
      )}
      <div className='relative'>
        <Image 
          src={doctorAgent?.image}
          alt={doctorAgent?.specialist}
          width={70}
          height={70}
          className='h-[70px] w-[70px] rounded-2xl border-2 border-border object-cover transition-transform group-hover:scale-105'
        />
      </div>
      <h2 className='mt-3 text-center text-sm font-bold'>{doctorAgent?.specialist}</h2>
      <p className='mt-1 line-clamp-2 text-center text-xs text-muted-foreground'>
        {doctorAgent?.description}
      </p>
      {isLocked && (
        <span className='mt-2 text-center text-xs font-semibold text-muted-foreground'>
          Premium Only
        </span>
      )}
    </button>
  )
}

export default SuggestedDoctorCard



