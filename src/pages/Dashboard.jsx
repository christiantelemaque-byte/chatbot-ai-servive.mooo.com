import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Chat from '../components/Chat'

export default function Dashboard() {
  const { user, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [faqs, setFaqs] = useState([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  useEffect(() => {
    if (user) {
      fetchApiKey()
      fetchFaqs()
    }
  }, [user])

  const fetchApiKey = async () => {
    const { data } = await supabase.from('api_keys').select('key').eq('user_id', user.id).single()
    if (data) setApiKey(data.key)
  }

  const fetchFaqs = async () => {
    const { data } = await supabase.from('faqs').select('*').eq('user_id', user.id)
    setFaqs(data || [])
  }

  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    await supabase.from('faqs').insert({ user_id: user.id, question: newFaq.question, answer: newFaq.answer })
    setNewFaq({ question: '', answer: '' })
    fetchFaqs()
    // trigger backend to re-index embeddings (call your backend webhook)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) await signIn(email, password)
      else await signUp(email, password)
    } catch (err) {
      alert(err.message)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-2xl font-bold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">{isLogin ? 'Login' : 'Create Account'}</button>
        </form>
        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 underline">{isLogin ? 'Sign Up' : 'Login'}</button>
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold">Your API Key</h2>
          <code className="block bg-gray-100 p-2 rounded mb-4">{apiKey || 'Loading...'}</code>
          <h2 className="text-xl font-semibold">Manage FAQs</h2>
          <div className="space-y-2 mb-4">
            <input type="text" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} className="w-full border p-2 rounded" />
            <textarea placeholder="Answer" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} className="w-full border p-2 rounded" />
            <button onClick={addFaq} className="bg-green-600 text-white px-4 py-2 rounded">Add FAQ</button>
          </div>
          <ul className="list-disc pl-5">
            {faqs.map(faq => (
              <li key={faq.id}><strong>{faq.question}</strong><br />{faq.answer}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Test Your Chatbot</h2>
          <div className="h-96">
            <Chat apiKey={apiKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
