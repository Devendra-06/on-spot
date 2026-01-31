'use client'

import React, { useState } from 'react'
import { AuthLogo } from './AuthLogo'
import CardBox from '../shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

export const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/email/login', {
        email: email,
        password: password
      })

      const { token } = response.data
      if (token) {
        localStorage.setItem('token', token)
        router.push('/')
      } else {
        setError('Login failed: No token received')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='min-h-screen w-full flex justify-center items-center bg-lightprimary py-8'>
        <div className='md:min-w-[450px] min-w-max'>
          <CardBox>
            <div className='flex justify-center mb-6'>
              <AuthLogo />
            </div>
            <p className='text-sm text-charcoal text-center mb-6'>
              Admin Panel
            </p>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <div className='mb-2 block'>
                  <Label htmlFor='email' className='font-medium'>
                    Email
                  </Label>
                </div>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <div className='mb-2 block'>
                  <Label htmlFor='password' className='font-medium'>
                    Password
                  </Label>
                </div>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className='flex flex-wrap gap-6 items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <Checkbox id='remember' checked />
                  <Label
                    className='text-link font-normal text-sm'
                    htmlFor='remember'>
                    Remember this device
                  </Label>
                </div>
                <Link
                  href='#'
                  className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                  Forgot Password ?
                </Link>
              </div>
              <Button className='w-full' type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className='flex items center gap-2 justify-center mt-6 flex-wrap'>
              <p className='text-base font-medium text-link dark:text-darklink'>
                New to Platform?
              </p>
              <Link
                href='/auth/register'
                className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                Create an account
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  )
}
