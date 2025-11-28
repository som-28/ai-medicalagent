'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconHistory, IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'
import moment from 'moment'

interface EmergencyHistoryItem {
  id: number
  emergencyType: string
  urgencyLevel: string
  status: string
  triggeredAt: string
  resolvedAt: string | null
  contactsNotified: any[]
  notes: string
}

export default function EmergencyHistory() {
  const [history, setHistory] = useState<EmergencyHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (showDialog) {
      loadHistory()
    }
  }, [showDialog])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/emergency/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      } else {
        toast.error('Failed to load emergency history')
      }
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Error loading history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-red-600 bg-red-100 dark:bg-red-950'
      case 'resolved':
        return 'text-green-600 bg-green-100 dark:bg-green-950'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconHistory size={16} className="mr-2" />
          Emergency History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconHistory size={24} />
            Emergency History
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconAlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
              <p>No emergency history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className={`font-medium ${getUrgencyColor(item.urgencyLevel)}`}>
                        {item.urgencyLevel} Priority
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {moment(item.triggeredAt).format('MMM DD, YYYY [at] h:mm A')}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{item.emergencyType}</span>
                    </div>

                    {item.contactsNotified && item.contactsNotified.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Contacts Notified:</span>
                        <span className="font-medium">
                          {item.contactsNotified.length} contact
                          {item.contactsNotified.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {item.resolvedAt && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Resolved:</span>
                        <span className="font-medium">
                          {moment(item.resolvedAt).format('MMM DD, YYYY [at] h:mm A')}
                        </span>
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{item.notes}</p>
                      </div>
                    )}
                  </div>

                  {item.status.toLowerCase() === 'active' && (
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info('Contact support to resolve this emergency')}
                      >
                        Mark as Resolved
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
