import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sessionDetail } from '../medical-agent/[sessionId]/page'
import moment from 'moment'
import ViewReportDailog from './ViewReportDailog'
import Image from 'next/image'

type Props = {
    historyList: sessionDetail[]
}

function HistoryTable({ historyList }: Props) {
    return (
        <div className='overflow-hidden rounded-2xl border'>
            <Table>
                <TableHeader>
                    <TableRow className='bg-muted/50 hover:bg-muted/50'>
                        <TableHead className='font-semibold'>Specialist</TableHead>
                        <TableHead className='font-semibold'>Consultation Notes</TableHead>
                        <TableHead className='font-semibold'>Date</TableHead>
                        <TableHead className="text-right font-semibold">Report</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {historyList.map((record: sessionDetail, index: number) => (
                        <TableRow key={record.id || index} className='transition-colors hover:bg-muted/30'>
                            <TableCell className="font-medium">
                                <div className='flex items-center gap-3'>
                                    <Image 
                                        src={record.selectedDoctor.image}
                                        alt={record.selectedDoctor.specialist}
                                        width={40}
                                        height={40}
                                        className='rounded-full object-cover'
                                    />
                                    <span>{record.selectedDoctor.specialist}</span>
                                </div>
                            </TableCell>
                            <TableCell className='max-w-md'>
                                <p className='line-clamp-2 text-sm text-muted-foreground'>{record.notes || 'No description'}</p>
                            </TableCell>
                            <TableCell>
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <span>{moment(new Date(record.createdOn)).format('MMM DD, YYYY')}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <ViewReportDailog record={record} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default HistoryTable