import { useParams } from 'react-router-dom'

export default function Summary() {
  const { id } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-navy mb-6">Assessment Summary</h1>
      <p className="text-navy/50">Summary and report for assessment {id} — coming in step 8</p>
    </div>
  )
}
