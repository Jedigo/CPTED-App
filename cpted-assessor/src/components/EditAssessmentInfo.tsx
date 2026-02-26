import { useState, useEffect } from 'react'
import { db } from '../db/database'
import type { Assessment, AssessmentType, TimeOfAssessment } from '../types'

interface Props {
  assessment: Assessment
  open: boolean
  onClose: () => void
}

export default function EditAssessmentInfo({ assessment, open, onClose }: Props) {
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [homeownerName, setHomeownerName] = useState('')
  const [homeownerContact, setHomeownerContact] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [assessorName, setAssessorName] = useState('')
  const [assessorBadgeId, setAssessorBadgeId] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('initial')
  const [dateOfAssessment, setDateOfAssessment] = useState('')
  const [timeOfAssessment, setTimeOfAssessment] = useState<TimeOfAssessment>('daytime')
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)

  const isWorship = assessment.property_type === 'places_of_worship'

  // Populate fields when modal opens
  useEffect(() => {
    if (open) {
      setAddress(assessment.address)
      setCity(assessment.city)
      setState(assessment.state)
      setZip(assessment.zip)
      setHomeownerName(assessment.homeowner_name)
      setHomeownerContact(assessment.homeowner_contact)
      setContactPhone(assessment.contact_phone)
      setAssessorName(assessment.assessor_name)
      setAssessorBadgeId(assessment.assessor_badge_id ?? '')
      setAssessmentType(assessment.assessment_type)
      setDateOfAssessment(assessment.date_of_assessment)
      setTimeOfAssessment(assessment.time_of_assessment)
      setErrors({})
    }
  }, [open, assessment])

  async function handleSave() {
    const required: Record<string, string> = {
      address,
      city,
      state,
      zip,
      homeownerName,
      assessorName,
    }

    const newErrors: Record<string, boolean> = {}
    let hasError = false
    for (const [key, val] of Object.entries(required)) {
      if (!val.trim()) {
        newErrors[key] = true
        hasError = true
      }
    }
    setErrors(newErrors)
    if (hasError) return

    setSaving(true)
    try {
      await db.assessments.update(assessment.id, {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        homeowner_name: homeownerName.trim(),
        homeowner_contact: homeownerContact.trim(),
        contact_phone: contactPhone.trim(),
        assessor_name: assessorName.trim(),
        assessor_badge_id: assessorBadgeId.trim() || undefined,
        assessment_type: assessmentType,
        date_of_assessment: dateOfAssessment,
        time_of_assessment: timeOfAssessment,
        updated_at: new Date().toISOString(),
      })
      onClose()
    } catch (err) {
      console.error('Failed to update assessment info:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const inputClass = (field: string) =>
    `w-full rounded-lg border px-4 py-3 text-base bg-surface outline-none transition-colors ${
      errors[field]
        ? 'border-red-500 ring-2 ring-red-200'
        : 'border-ink/20 focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30'
    }`

  const labelClass = 'block text-sm font-semibold text-ink mb-1'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
        <div
          className="bg-surface rounded-2xl shadow-xl border border-ink/10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
            <h2 className="text-lg font-bold text-ink">Edit Assessment Info</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {/* Property Information */}
            <section>
              <h3 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">
                Property Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass('address')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">Address is required</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass('city')}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">Required</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={inputClass('state')}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">Required</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      ZIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className={inputClass('zip')}
                    />
                    {errors.zip && (
                      <p className="text-red-500 text-sm mt-1">Required</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      {isWorship ? 'Organization Name' : 'Homeowner Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={homeownerName}
                      onChange={(e) => setHomeownerName(e.target.value)}
                      className={inputClass('homeownerName')}
                    />
                    {errors.homeownerName && (
                      <p className="text-red-500 text-sm mt-1">Required</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      {isWorship ? 'Contact Person' : 'Homeowner Contact'}
                    </label>
                    <input
                      type="text"
                      value={homeownerContact}
                      onChange={(e) => setHomeownerContact(e.target.value)}
                      className={inputClass('homeownerContact')}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={inputClass('contactPhone')}
                  />
                </div>
              </div>
            </section>

            {/* Assessor Information */}
            <section>
              <h3 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">
                Assessor Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Assessor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assessorName}
                    onChange={(e) => setAssessorName(e.target.value)}
                    className={inputClass('assessorName')}
                  />
                  {errors.assessorName && (
                    <p className="text-red-500 text-sm mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Badge / ID Number</label>
                  <input
                    type="text"
                    value={assessorBadgeId}
                    onChange={(e) => setAssessorBadgeId(e.target.value)}
                    className={inputClass('assessorBadgeId')}
                  />
                </div>
              </div>
            </section>

            {/* Assessment Details */}
            <section>
              <h3 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">
                Assessment Details
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Assessment Type</label>
                    <select
                      value={assessmentType}
                      onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                      className="w-full rounded-lg border border-ink/20 px-4 py-3 text-base bg-surface outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
                    >
                      <option value="initial">Initial</option>
                      <option value="follow_up">Follow-Up</option>
                      <option value="re_assessment">Re-Assessment</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Time of Assessment</label>
                    <select
                      value={timeOfAssessment}
                      onChange={(e) => setTimeOfAssessment(e.target.value as TimeOfAssessment)}
                      className="w-full rounded-lg border border-ink/20 px-4 py-3 text-base bg-surface outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
                    >
                      <option value="daytime">Daytime</option>
                      <option value="nighttime">Nighttime</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Date of Assessment</label>
                  <input
                    type="date"
                    value={dateOfAssessment}
                    onChange={(e) => setDateOfAssessment(e.target.value)}
                    className="w-full rounded-lg border border-ink/20 px-4 py-3 text-base bg-surface outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-navy text-white hover:bg-navy-light active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
