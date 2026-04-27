export default function ApiDocs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
      <p className="mb-4">Integrate our chatbot into your own application using the REST API.</p>
      <div className="bg-gray-800 text-white p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Endpoint</h2>
        <code>POST https://your-backend-url.com/api/chat</code>
        <h2 className="text-xl font-semibold mt-4 mb-2">Headers</h2>
        <code>Content-Type: application/json</code>
        <h2 className="text-xl font-semibold mt-4 mb-2">Body</h2>
        <pre className="bg-gray-900 p-2 rounded">
{`{
  "message": "What are your hours?",
  "apiKey": "your_api_key_here"
}`}
        </pre>
        <h2 className="text-xl font-semibold mt-4 mb-2">Response</h2>
        <pre className="bg-gray-900 p-2 rounded">
{`{
  "reply": "Our hours are 9am-5pm Monday to Friday."
}`}
        </pre>
      </div>
      <p>Sign up to get your API key from the dashboard.</p>
    </div>
  )
}
