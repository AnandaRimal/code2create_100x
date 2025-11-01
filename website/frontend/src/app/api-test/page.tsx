'use client'

import { useState } from 'react'

export default function APITestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`)
      const data = await response.json()
      setResult(`✅ API Connected! Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ API Error: ${error}`)
      console.error('API Test Error:', error)
    }
    setLoading(false)
  }

  const testRegistration = async () => {
    setLoading(true)
    try {
      const testData = {
        name: 'API Test User',
        email: `test${Date.now()}@example.com`,
        citizenship_no: `${Date.now()}`,
        contact_no: '9876543210',
        password: 'TestPass123',
        company_name: 'API Test Company'
      }
      
      console.log('Testing registration with:', testData)
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      setResult(`✅ Registration Test! Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ Registration Error: ${error}`)
      console.error('Registration Test Error:', error)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-4">
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
      </div>
      
      <div className="space-x-4 mb-6">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button 
          onClick={testRegistration}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Test Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result || 'No test run yet'}</pre>
      </div>
    </div>
  )
}
