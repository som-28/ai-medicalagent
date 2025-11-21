import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import moment from 'moment'
import Image from 'next/image'
import { IconCalendar, IconUser, IconFileText } from '@tabler/icons-react'

type props = {
    record: sessionDetail
}

function ViewReportDailog({ record }: props) {
  const reportData = record.report as any;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='rounded-lg'>View Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-center text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            Medical Consultation Report
          </DialogTitle>
          <p className='text-center text-sm text-muted-foreground'>
            AI-Generated Medical Summary
          </p>
        </DialogHeader>
        <DialogDescription asChild>
          <div className='mt-4 space-y-6'>
            {/* Doctor Info */}
            <div className='flex items-center gap-4 rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5'>
              <div className='relative'>
                <Image 
                  src={record.selectedDoctor?.image}
                  alt={record.selectedDoctor?.specialist}
                  width={70}
                  height={70}
                  className='rounded-2xl object-cover border-2 border-primary/30 shadow-md'
                />
              </div>
              <div className='flex-1'>
                <h3 className='font-bold text-xl text-foreground'>{record.selectedDoctor?.specialist}</h3>
                <p className='flex items-center gap-1.5 text-sm text-muted-foreground mt-1'>
                  <IconCalendar size={16} />
                  {moment(new Date(record?.createdOn)).format('MMM DD, YYYY [at] h:mm A')}
                </p>
              </div>
            </div>

            {/* Symptoms/Notes */}
            <div className='space-y-3'>
              <h3 className='flex items-center gap-2 text-lg font-semibold text-foreground'>
                <IconFileText size={20} className='text-primary' />
                Chief Complaint
              </h3>
              <div className='rounded-xl border bg-muted/50 p-4'>
                <p className='text-sm leading-relaxed'>
                  {reportData?.chiefComplaint || record.notes || 'No details provided'}
                </p>
              </div>
            </div>

            {/* Summary */}
            {reportData?.summary && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-foreground'>Summary</h3>
                <div className='rounded-xl border bg-muted/50 p-4'>
                  <p className='text-sm leading-relaxed'>{reportData.summary}</p>
                </div>
              </div>
            )}

            {/* Symptoms */}
            {reportData?.symptoms && reportData.symptoms.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-foreground'>Symptoms</h3>
                <div className='space-y-2 rounded-xl border bg-muted/50 p-4'>
                  {reportData.symptoms.map((symptom: string, idx: number) => (
                    <div key={idx} className='flex items-start gap-2'>
                      <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-primary' />
                      <span className='text-sm'>{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duration & Severity */}
            {(reportData?.duration || reportData?.severity) && (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {reportData?.duration && (
                  <div className='space-y-2 rounded-xl border bg-muted/50 p-4'>
                    <h3 className='text-sm font-semibold text-foreground'>Duration</h3>
                    <p className='text-sm text-muted-foreground'>{reportData.duration}</p>
                  </div>
                )}
                {reportData?.severity && (
                  <div className='space-y-2 rounded-xl border bg-muted/50 p-4'>
                    <h3 className='text-sm font-semibold text-foreground'>Severity</h3>
                    <p className='text-sm capitalize text-muted-foreground'>{reportData.severity}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {reportData?.recommendations && reportData.recommendations.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-foreground'>Recommendations</h3>
                <div className='space-y-2 rounded-xl border bg-muted/50 p-4'>
                  {reportData.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className='flex items-start gap-2'>
                      <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-primary' />
                      <span className='text-sm'>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {reportData?.medicationsMentioned && reportData.medicationsMentioned.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-foreground'>Medications Mentioned</h3>
                <div className='space-y-2 rounded-xl border bg-muted/50 p-4'>
                  {reportData.medicationsMentioned.map((med: string, idx: number) => (
                    <div key={idx} className='flex items-start gap-2'>
                      <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-primary' />
                      <span className='text-sm'>{med}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className='rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4'>
              <p className='text-xs leading-relaxed text-foreground/80'>
                <strong className='font-semibold'>⚠️ Medical Disclaimer:</strong> This is an AI-generated report for informational purposes only. 
                Always consult with a qualified healthcare professional for medical advice, diagnosis, and treatment.
              </p>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReportDailog