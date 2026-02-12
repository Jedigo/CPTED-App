import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-2">CPTED Assessor</h1>
        <p className="text-blue-medium text-lg">Residential Site Assessment Tool</p>
      </div>

      <Link
        to="/assessment/new"
        className="bg-navy text-white text-xl font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-navy-light active:bg-navy-dark transition-colors"
      >
        + New Assessment
      </Link>

      <div className="mt-12 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-navy mb-4">Recent Assessments</h2>
        <p className="text-navy/50 text-center py-8">No assessments yet</p>
      </div>
    </div>
  )
}
