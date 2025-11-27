import React, { useMemo, useState, useCallback, useEffect } from 'react'
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
import { IconCalendar, IconUser, IconFileText, IconDownload } from '@tabler/icons-react'
import { generatePDFReport } from '@/lib/pdfGenerator'
import { toast } from 'sonner'

type props = {
    record: sessionDetail
}

function ViewReportDailog({ record }: props) {
  const reportData = record.report as any;
  const [pageIndex, setPageIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Build digest pages dynamically based on available sections
  const pages = useMemo(() => {
    const arr: { key: string; title: string; content: React.ReactElement }[] = [];
    arr.push({
      key: 'doctor',
      title: 'Doctor Information',
      content: (
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
      )
    });
    arr.push({
      key: 'chiefComplaint',
      title: 'Chief Complaint',
      content: (
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
      )
    });
    if (reportData?.summary) {
      arr.push({
        key: 'summary',
        title: 'Summary',
        content: (
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold text-foreground'>Summary</h3>
            <div className='rounded-xl border bg-muted/50 p-4'>
              <p className='text-sm leading-relaxed'>{reportData.summary}</p>
            </div>
          </div>
        )
      })
    }
    if (reportData?.symptoms && reportData.symptoms.length > 0) {
      arr.push({
        key: 'symptoms',
        title: 'Symptoms',
        content: (
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
        )
      })
    }
    if (reportData?.duration || reportData?.severity) {
      arr.push({
        key: 'clinical',
        title: 'Clinical Details',
        content: (
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
        )
      })
    }
    if (reportData?.recommendations && reportData.recommendations.length > 0) {
      arr.push({
        key: 'recommendations',
        title: 'Recommendations',
        content: (
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
        )
      })
    }
    if (reportData?.medicationsMentioned && reportData.medicationsMentioned.length > 0) {
      arr.push({
        key: 'medications',
        title: 'Medications Mentioned',
        content: (
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
        )
      })
    }
    // Disclaimer always last
    arr.push({
      key: 'disclaimer',
      title: 'Disclaimer',
      content: (
        <div className='rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4'>
          <p className='text-xs leading-relaxed text-foreground/80'>
            <strong className='font-semibold'>⚠️ Medical Disclaimer:</strong> This is an AI-generated report for informational purposes only. 
            Always consult with a qualified healthcare professional for medical advice, diagnosis, and treatment.
          </p>
        </div>
      )
    });
    return arr;
  }, [record.selectedDoctor?.image, record.selectedDoctor?.specialist, record.createdOn, reportData?.chiefComplaint, reportData?.summary, reportData?.symptoms, reportData?.duration, reportData?.severity, reportData?.recommendations, reportData?.medicationsMentioned, record.notes]);

  const goNext = useCallback(() => setPageIndex(i => Math.min(i + 1, pages.length - 1)), [pages.length]);
  const goPrev = useCallback(() => setPageIndex(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!hasInteracted) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, hasInteracted]);

  const handleDownloadPDF = () => {
    try {
      generatePDFReport(record);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    }
  };

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
          <div className='mt-4 relative'>
            {/* Digest Carousel */}
            <div 
              className='group relative overflow-hidden rounded-2xl border bg-card/50 p-6 backdrop-blur'
              onMouseEnter={() => setHasInteracted(true)}
            >
              {/* Page content */}
              <div className='min-h-[260px]'>
                {pages[pageIndex]?.content}
              </div>

              {/* Left Arrow */}
              {pageIndex > 0 && (
                <button
                  aria-label='Previous section'
                  onClick={goPrev}
                  className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 p-2 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-primary'
                >
                  <span className='sr-only'>Previous</span>
                  ‹
                </button>
              )}
              {/* Right Arrow */}
              {pageIndex < pages.length - 1 && (
                <button
                  aria-label='Next section'
                  onClick={goNext}
                  className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 p-2 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-primary'
                >
                  <span className='sr-only'>Next</span>
                  ›
                </button>
              )}

              {/* Page indicators */}
              <div className='mt-6 flex justify-center gap-2'>
                {pages.map((p, i) => (
                  <button
                    key={p.key}
                    aria-label={`Go to ${p.title}`}
                    onClick={() => setPageIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === pageIndex ? 'bg-primary' : 'bg-muted hover:bg-primary/40'}`}
                  />
                ))}
              </div>
              <p className='mt-3 text-center text-xs font-medium text-muted-foreground'>
                {pages[pageIndex]?.title} ({pageIndex + 1}/{pages.length})
              </p>
            </div>

            {/* Download PDF Button */}
            <div className='flex justify-center pt-6'>
              <Button 
                onClick={handleDownloadPDF}
                className='gap-2 rounded-xl'
                size='lg'
              >
                <IconDownload size={20} />
                Download Full Report (PDF)
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default ViewReportDailog