'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconAlertTriangle, IconPhoneCall } from '@tabler/icons-react'
import { toast } from 'sonner'

interface SOSButtonProps {
  sessionId?: string
  className?: string
}

export default function SOSButton({ sessionId, className }: SOSButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimer) clearTimeout(holdTimer)
    }
  }, [holdTimer])

  // Cancel countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && isEmergencyActive) {
      triggerEmergency()
    }
  }, [countdown, isEmergencyActive])

  const handleSOSClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmEmergency = () => {
    setShowConfirmDialog(false)
    setIsEmergencyActive(true)
    setCountdown(30) // 30 second countdown to cancel
    toast.warning('Emergency mode activated. You have 30 seconds to cancel.', {
      duration: 5000,
    })
  }

  const handleCancelEmergency = () => {
    setIsEmergencyActive(false)
    setCountdown(0)
    setShowConfirmDialog(false)
    toast.info('Emergency cancelled')
  }

  const triggerEmergency = async () => {
    try {
      toast.loading('Triggering emergency protocol...', { id: 'sos-trigger' })
      
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Emergency services have been notified!', { id: 'sos-trigger' })
        setIsEmergencyActive(false)
      } else {
        toast.error(data.error || 'Failed to trigger emergency', { id: 'sos-trigger' })
        setIsEmergencyActive(false)
      }
    } catch (error) {
      console.error('Emergency trigger error:', error)
      toast.error('Failed to trigger emergency. Please call 911 directly.', { id: 'sos-trigger' })
      setIsEmergencyActive(false)
    }
  }

  return (
    <>
      {/* SOS Button */}
      <Button
        onClick={handleSOSClick}
        className={`bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg ${
          isEmergencyActive ? 'animate-pulse' : ''
        } ${className}`}
        size="lg"
      >
        <IconAlertTriangle className="mr-2" size={20} />
        {isEmergencyActive ? `Emergency Active (${countdown}s)` : 'SOS'}
      </Button>

      {/* Active Emergency Banner */}
      {isEmergencyActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center font-bold animate-pulse">
          <div className="flex items-center justify-center gap-4">
            <IconAlertTriangle size={24} />
            <span>EMERGENCY MODE ACTIVE - {countdown}s to cancel</span>
            <Button
              onClick={handleCancelEmergency}
              variant="outline"
              size="sm"
              className="bg-white text-red-600 hover:bg-gray-100"
            >
              Cancel Emergency
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <IconAlertTriangle size={24} />
              Emergency SOS Activation
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p className="font-semibold">
                Are you experiencing a medical emergency?
              </p>
              
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
                <p className="text-sm">When you activate SOS, we will:</p>
                <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                  <li>Alert your emergency contacts</li>
                  <li>Generate an emergency medical report</li>
                  <li>Connect you with priority medical assistance</li>
                  <li>Share your location (if enabled)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ For life-threatening emergencies, call 911 immediately
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleConfirmEmergency}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <IconPhoneCall className="mr-2" size={18} />
                  Activate Emergency
                </Button>
                <Button
                  onClick={handleCancelEmergency}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
