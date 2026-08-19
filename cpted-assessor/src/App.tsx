import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import NewAssessment from './pages/NewAssessment.tsx'
import Assessment from './pages/Assessment.tsx'
import Summary from './pages/Summary.tsx'
import SchoolProfile from './pages/SchoolProfile.tsx'
import LightSurveys from './pages/LightSurveys.tsx'
import LightSurveyDetail from './pages/LightSurveyDetail.tsx'

function App() {
  return (
    <div className="min-h-full">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment/new" element={<NewAssessment />} />
        <Route path="/assessment/:id" element={<Assessment />} />
        <Route path="/assessment/:id/summary" element={<Summary />} />
        <Route path="/assessment/:id/school" element={<SchoolProfile />} />
        <Route path="/assessment/:id/light" element={<LightSurveys />} />
        <Route path="/assessment/:id/light/:surveyId" element={<LightSurveyDetail />} />
      </Routes>
    </div>
  )
}

export default App
