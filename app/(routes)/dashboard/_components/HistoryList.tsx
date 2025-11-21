'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import AddNewSessionDialog from './AddNewSessionDialog'
import axios from 'axios'
import HistoryTable from './HistoryTable'
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast } from 'sonner'

function HistoryList() {
    const [historyList, setHistoryList] = useState<sessionDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      GetHistoryList();
    }, [])

    const GetHistoryList = async() => {
      try {
        setLoading(true);
        setError(null);
        const result = await axios.get('/api/session-chat?sessionId=all');
        setHistoryList(result.data || []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load consultation history');
        toast.error('Failed to load consultation history');
      } finally {
        setLoading(false);
      }
    }

  if (loading) {
    return (
      <div className='flex justify-center py-20'>
        <LoadingSpinner size="lg" text="Loading consultation history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-destructive/50 bg-destructive/5 p-8 text-center'>
        <h2 className='mb-2 text-xl font-bold text-destructive'>Error Loading History</h2>
        <p className='mb-4 text-muted-foreground'>{error}</p>
        <Button onClick={GetHistoryList} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div>
        {historyList.length === 0 ?
          <div className='flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12'>
            <div className='mb-4 rounded-full bg-muted p-6'>
              <Image src= {'/medical-assistant.png'} alt='empty' width={80} height={80} className='opacity-50' />
            </div>
            <h2 className='mb-2 text-2xl font-bold'>No Consultations Yet</h2>
            <p className='mb-6 text-muted-foreground'>Start your first consultation with an AI specialist</p>
            <AddNewSessionDialog/>
          </div>
          : <div>
            <div className='mb-4'>
              <h2 className='text-2xl font-bold'>Recent Consultations</h2>
              <p className='text-muted-foreground'>View your medical consultation history</p>
            </div>
            <HistoryTable historyList={historyList}/>
          </div>
        }
    </div>
  )
}

export default HistoryList