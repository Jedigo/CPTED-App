import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/database'
import { ZONES } from '../data/zones'
import type {
  Assessment,
  AssessmentType,
  TimeOfAssessment,
  ZoneScore,
} from '../types'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function NewAssessment() {
  const navigate = useNavigate()

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('FL')
  const [zip, setZip] = useState('')
  const [homeownerName, setHomeownerName] = useState('')
  const [homeownerContact, setHomeownerContact] = useState('')
  const [assessorName, setAssessorName] = useState('')
  const [assessorBadgeId, setAssessorBadgeId] = useState('')
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('initial')
  const [dateOfAssessment, setDateOfAssessment] = useState(todayISO())
  const [timeOfAssessment, setTimeOfAssessment] = useState<TimeOfAssessment>('daytime')
  const [weatherConditions, setWeatherConditions] = useState('')

  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

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

    setSubmitting(true)

    try {
      const id = uuidv4()
      const now = new Date().toISOString()

      const assessment: Assessment = {
        id,
        created_at: now,
        updated_at: now,
        status: 'in_progress',
        property_type: 'single_family_residential',
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        homeowner_name: homeownerName.trim(),
        homeowner_contact: homeownerContact.trim(),
        assessor_name: assessorName.trim(),
        assessor_badge_id: assessorBadgeId.trim() || undefined,
        assessment_type: assessmentType,
        weather_conditions: weatherConditions.trim(),
        time_of_assessment: timeOfAssessment,
        date_of_assessment: dateOfAssessment,
        overall_score: null,
        top_recommendations: [],
        quick_wins: [],
        notes: '',
        synced_at: null,
      }

      const zoneScores: ZoneScore[] = ZONES.map((zone) => ({
        id: uuidv4(),
        assessment_id: id,
        zone_key: zone.key,
        zone_name: zone.name,
        zone_order: zone.order,
        average_score: null,
        priority_findings: '',
        notes: '',
        completed: false,
      }))

      await db.assessments.add(assessment)
      await db.zone_scores.bulkAdd(zoneScores)

      navigate(`/assessment/${id}`)
    } catch (err) {
      console.error('Failed to create assessment:', err)
      setSubmitting(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full rounded-lg border px-4 py-3 text-base bg-white outline-none transition-colors ${
      errors[field]
        ? 'border-red-500 ring-2 ring-red-200'
        : 'border-navy/20 focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30'
    }`

  const labelClass = 'block text-sm font-semibold text-navy mb-1'

  return (
    <div className="min-h-full bg-blue-pale">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-4 flex items-center gap-4">
        <Link
          to="/"
          className="text-white/80 hover:text-white text-sm font-medium flex items-center gap-1"
        >
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">New Assessment</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6 pb-24">
        {/* Property Information */}
        <section className="bg-white rounded-xl shadow-sm border border-navy/10 p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Property Information</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                className={inputClass('address')}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">Address is required</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Daytona Beach"
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
                  placeholder="32114"
                  className={inputClass('zip')}
                />
                {errors.zip && (
                  <p className="text-red-500 text-sm mt-1">Required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Homeowner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={homeownerName}
                  onChange={(e) => setHomeownerName(e.target.value)}
                  placeholder="Jane Smith"
                  className={inputClass('homeownerName')}
                />
                {errors.homeownerName && (
                  <p className="text-red-500 text-sm mt-1">Required</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Homeowner Contact</label>
                <input
                  type="text"
                  value={homeownerContact}
                  onChange={(e) => setHomeownerContact(e.target.value)}
                  placeholder="Phone or email"
                  className={inputClass('homeownerContact')}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Property Type</label>
              <select
                value="single_family_residential"
                disabled
                className="w-full rounded-lg border border-navy/20 px-4 py-3 text-base bg-gray-50 text-navy/70"
              >
                <option value="single_family_residential">
                  Single Family Residential
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Assessor Information */}
        <section className="bg-white rounded-xl shadow-sm border border-navy/10 p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Assessor Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Assessor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                placeholder="Deputy J. Doe"
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
                placeholder="Optional"
                className={inputClass('assessorBadgeId')}
              />
            </div>
          </div>
        </section>

        {/* Assessment Details */}
        <section className="bg-white rounded-xl shadow-sm border border-navy/10 p-6">
          <h2 className="text-lg font-bold text-navy mb-4">Assessment Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Assessment Type</label>
                <select
                  value={assessmentType}
                  onChange={(e) => setAssessmentType(e.target.value as AssessmentType)}
                  className="w-full rounded-lg border border-navy/20 px-4 py-3 text-base bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
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
                  className="w-full rounded-lg border border-navy/20 px-4 py-3 text-base bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
                >
                  <option value="daytime">Daytime</option>
                  <option value="nighttime">Nighttime</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Assessment</label>
                <input
                  type="date"
                  value={dateOfAssessment}
                  onChange={(e) => setDateOfAssessment(e.target.value)}
                  className="w-full rounded-lg border border-navy/20 px-4 py-3 text-base bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
                />
              </div>
              <div>
                <label className={labelClass}>Weather Conditions</label>
                <input
                  type="text"
                  value={weatherConditions}
                  onChange={(e) => setWeatherConditions(e.target.value)}
                  placeholder="Clear, 78°F"
                  className={inputClass('weatherConditions')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-navy hover:bg-navy-light active:bg-navy-dark text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors disabled:opacity-50"
        >
          {submitting ? 'Creating Assessment...' : 'Start Assessment'}
        </button>
      </form>
    </div>
  )
}
