'use client'

import React, { useState } from 'react'
import { AuthLogo } from './AuthLogo'
import CardBox from '../shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

export const Register = () => {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/auth/email/register', {
        firstName,
        lastName,
        email,
        password
      })

      // Redirect to login after successful registration
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
              Create your account
            </p>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className='mb-2 block'>
                    <Label htmlFor='firstName' className='font-medium'>
                      First Name
                    </Label>
                  </div>
                  <Input
                    id='firstName'
                    type='text'
                    placeholder='First name'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div className='mb-2 block'>
                    <Label htmlFor='lastName' className='font-medium'>
                      Last Name
                    </Label>
                  </div>
                  <Input
                    id='lastName'
                    type='text'
                    placeholder='Last name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                  minLength={6}
                />
              </div>
              <Button className='w-full' type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
            <div className='flex items center gap-2 justify-center mt-6 flex-wrap'>
              <p className='text-base font-medium text-link dark:text-darklink'>
                Already have an account?
              </p>
              <Link
                href='/auth/login'
                className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                Sign In
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  )
}
