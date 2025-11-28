'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconPlus, IconTrash, IconEdit, IconAlertCircle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

interface EmergencyContact {
  id?: number
  name: string
  relationship: string
  phoneNumber: string
  email: string
  isPrimary: boolean
}

interface EmergencyProfile {
  bloodType: string
  allergies: string[]
  medications: string[]
  medicalConditions: string[]
  emergencyNotes: string
  shareLocation: boolean
}

export default function EmergencyProfileManager() {
  const { user } = useUser()
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [profile, setProfile] = useState<EmergencyProfile>({
    bloodType: '',
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyNotes: '',
    shareLocation: true,
  })
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [contactForm, setContactForm] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    isPrimary: false,
  })

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      loadEmergencyData()
    }
  }, [user])

  const loadEmergencyData = async () => {
    try {
      const response = await fetch('/api/emergency/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.contacts) setContacts(data.contacts)
        if (data.profile) setProfile(data.profile)
      }
    } catch (error) {
      console.error('Failed to load emergency data:', error)
    }
  }

  const handleSaveContact = async () => {
    if (!contactForm.name || !contactForm.phoneNumber) {
      toast.error('Name and phone number are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/emergency/contacts', {
        method: editingContact ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          id: editingContact?.id,
        }),
      })

      if (response.ok) {
        toast.success(editingContact ? 'Contact updated' : 'Contact added')
        setShowContactDialog(false)
        setEditingContact(null)
        setContactForm({
          name: '',
          relationship: '',
          phoneNumber: '',
          email: '',
          isPrimary: false,
        })
        loadEmergencyData()
      } else {
        toast.error('Failed to save contact')
      }
    } catch (error) {
      toast.error('Error saving contact')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return

    try {
      const response = await fetch(`/api/emergency/contacts?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Contact deleted')
        loadEmergencyData()
      } else {
        toast.error('Failed to delete contact')
      }
    } catch (error) {
      toast.error('Error deleting contact')
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/emergency/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast.success('Emergency profile updated')
        setShowProfileDialog(false)
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const editContact = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setContactForm(contact)
    setShowContactDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Manage your emergency contacts and medical information
      </p>

      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
        <IconAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-semibold text-red-800 dark:text-red-200">
            This information will be used in medical emergencies
          </p>
          <p className="text-red-700 dark:text-red-300 mt-1">
            Keep your emergency contacts and medical information up to date. This data will be
            shared with emergency responders when you activate the SOS feature.
          </p>
        </div>
      </div>

      {/* Emergency Profile */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Medical Information</h3>
          <Button onClick={() => setShowProfileDialog(true)} variant="outline" size="sm">
            <IconEdit size={16} className="mr-2" />
            Edit Profile
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Blood Type:</span>
            <span className="ml-2 font-medium">{profile.bloodType || 'Not set'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Allergies:</span>
            <span className="ml-2 font-medium">
              {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Medications:</span>
            <span className="ml-2 font-medium">
              {profile.medications.length > 0 ? profile.medications.join(', ') : 'None'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Conditions:</span>
            <span className="ml-2 font-medium">
              {profile.medicalConditions.length > 0
                ? profile.medicalConditions.join(', ')
                : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
          <Button onClick={() => setShowContactDialog(true)} size="sm">
            <IconPlus size={16} className="mr-2" />
            Add Contact
          </Button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No emergency contacts added yet
          </p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{contact.name}</p>
                    {contact.isPrimary && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>
                  {contact.email && (
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => editContact(contact)}
                    variant="ghost"
                    size="sm"
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteContact(contact.id!)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Relationship</label>
              <input
                type="text"
                value={contactForm.relationship}
                onChange={(e) =>
                  setContactForm({ ...contactForm, relationship: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Spouse, Parent, Friend, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number *</label>
              <input
                type="tel"
                value={contactForm.phoneNumber}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phoneNumber: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="john@example.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={contactForm.isPrimary}
                onChange={(e) =>
                  setContactForm({ ...contactForm, isPrimary: e.target.checked })
                }
                id="isPrimary"
              />
              <label htmlFor="isPrimary" className="text-sm">
                Set as primary contact
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveContact} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Contact'}
              </Button>
              <Button
                onClick={() => {
                  setShowContactDialog(false)
                  setEditingContact(null)
                  setContactForm({
                    name: '',
                    relationship: '',
                    phoneNumber: '',
                    email: '',
                    isPrimary: false,
                  })
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medical Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Blood Type</label>
              <select
                value={profile.bloodType}
                onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Allergies (comma-separated)</label>
              <input
                type="text"
                value={profile.allergies.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    allergies: e.target.value.split(',').map((a) => a.trim()).filter(Boolean),
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Penicillin, Peanuts, Latex"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Medications (comma-separated)</label>
              <input
                type="text"
                value={profile.medications.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    medications: e.target.value.split(',').map((m) => m.trim()).filter(Boolean),
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Aspirin, Metformin"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Medical Conditions (comma-separated)
              </label>
              <input
                type="text"
                value={profile.medicalConditions.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    medicalConditions: e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Diabetes, Hypertension"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Emergency Notes</label>
              <textarea
                value={profile.emergencyNotes}
                onChange={(e) => setProfile({ ...profile, emergencyNotes: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Any additional information for emergency responders..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={profile.shareLocation}
                onChange={(e) =>
                  setProfile({ ...profile, shareLocation: e.target.checked })
                }
                id="shareLocation"
              />
              <label htmlFor="shareLocation" className="text-sm">
                Share my location during emergencies
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveProfile} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button onClick={() => setShowProfileDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
