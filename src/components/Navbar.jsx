import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">AI Chatbot Service</Link>
        <div className="space-x-4">
          <Link to="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</Link>
          <Link to="/api" className="text-gray-700 hover:text-blue-600">API</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <button onClick={signOut} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <Link to="/dashboard" className="bg-blue-600 text-white px-3 py-1 rounded">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
