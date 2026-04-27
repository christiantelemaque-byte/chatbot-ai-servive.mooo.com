export default function Pricing() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Simple Pricing</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-3xl font-bold my-4">$0<span className="text-base">/month</span></p>
          <ul className="text-sm text-gray-600 mb-6">
            <li>100 messages/month</li>
            <li>1 chatbot</li>
            <li>Basic support</li>
          </ul>
          <button className="bg-gray-200 px-4 py-2 rounded">Current Plan</button>
        </div>
        <div className="border rounded-lg p-6 text-center bg-blue-50 border-blue-300">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="text-3xl font-bold my-4">$29<span className="text-base">/month</span></p>
          <ul className="text-sm text-gray-600 mb-6">
            <li>10,000 messages/month</li>
            <li>Unlimited chatbots</li>
            <li>Priority support</li>
            <li>API access</li>
          </ul>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Subscribe</button>
        </div>
        <div className="border rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold">Enterprise</h2>
          <p className="text-3xl font-bold my-4">Custom</p>
          <ul className="text-sm text-gray-600 mb-6">
            <li>Unlimited messages</li>
            <li>Custom SLA</li>
            <li>On-premise option</li>
          </ul>
          <button className="bg-gray-200 px-4 py-2 rounded">Contact Us</button>
        </div>
      </div>
    </div>
  )
}
