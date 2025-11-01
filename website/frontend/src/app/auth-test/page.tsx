'use client'

import { useState } from 'react'

export default function AuthTestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      // Test login
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123'
      }
      
      console.log('Testing login with:', loginData)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)

        
      })
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`)
      }
      
      const loginResult = await response.json()
      
      // Get profile
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/profile`, {
        headers: {
          'Authorization': `Bearer ${loginResult.access_token}`
        }
      })
      
      if (!profileResponse.ok) {
        throw new Error(`Profile fetch failed: ${profileResponse.status}`)
      }
      
      const profile = await profileResponse.json()
      
      // Store data like the login page does
      localStorage.setItem('auth_token', loginResult.access_token)
      localStorage.setItem('user_data', JSON.stringify({
        shop_id: profile.owner_id,
        shop_name: profile.company_name || profile.name,
        subscription_tier: 'free',
        email: profile.email,
        name: profile.name,
        company_name: profile.company_name,
        contact_no: profile.contact_no,
        citizenship_no: profile.citizenship_no
      }))
      
      setResult(`✅ Login Success!\nToken: ${loginResult.access_token.substring(0, 50)}...\nProfile: ${JSON.stringify(profile, null, 2)}`)
    } catch (error) {
      setResult(`❌ Login Error: ${error}`)
      console.error('Login Test Error:', error)
    }
    setLoading(false)
  }

  const checkStoredData = () => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    setResult(`Stored Data:\nToken: ${token ? token.substring(0, 50) + '...' : 'None'}\nUser Data: ${userData || 'None'}`)
  }

  const clearData = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setResult('✅ Cleared stored data')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-x-4 mb-6">
        <button 
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login Flow'}
        </button>
        
        <button 
          onClick={checkStoredData}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Check Stored Data
        </button>
        
        <button 
          onClick={clearData}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear Data
        </button>
        
        <a 
          href="/dashboard"
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 inline-block"
        >
          Go to Dashboard
        </a>
      </div>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Test Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result || 'No test run yet'}</pre>
      </div>
    </div>
  )
}
