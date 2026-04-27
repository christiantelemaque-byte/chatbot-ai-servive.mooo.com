import { Link } from 'react-router-dom'
import Chat from '../components/Chat'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  // Pour la démo sans login, on utilise une clé API publique (à définir)
  const demoApiKey = 'PUBLIC_DEMO_KEY'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">AI Chatbot Service</h1>
        <p className="text-gray-600 mt-2">Train your bot with your own FAQs – then integrate via API</p>
        {!user && (
          <Link to="/dashboard" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded">Get Started</Link>
        )}
      </div>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Try the Demo</h2>
        <div className="h-96">
          <Chat apiKey={demoApiKey} />
        </div>
      </div>
    </div>
  )
}
