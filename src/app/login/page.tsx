import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          <div className="flex flex-col lg:flex-row items-center gap-12" suppressHydrationWarning>
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2" suppressHydrationWarning>
              <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto" suppressHydrationWarning>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>Welcome Back</h1>
                <p className="text-gray-600 mb-8" suppressHydrationWarning>
                  Log in to access your account, track orders, and enjoy exclusive offers.
                </p>
                
                {/* Login Form Component */}
                <LoginForm />
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="w-full lg:w-1/2 hidden lg:block" suppressHydrationWarning>
              <div className="relative h-[550px] w-full rounded-lg overflow-hidden shadow-xl" suppressHydrationWarning>
                <Image 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Shopping Experience"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-transparent flex flex-col justify-center pl-10" suppressHydrationWarning>
                  <h2 className="text-3xl font-bold text-white mb-4" suppressHydrationWarning>
                    Exclusive Member Benefits
                  </h2>
                  <ul className="space-y-3 text-white" suppressHydrationWarning>
                    <li className="flex items-center" suppressHydrationWarning>
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Members-only deals and discounts
                    </li>
                    <li className="flex items-center" suppressHydrationWarning>
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Faster checkout experience
                    </li>
                    <li className="flex items-center" suppressHydrationWarning>
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Order tracking and history
                    </li>
                    <li className="flex items-center" suppressHydrationWarning>
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Personalized recommendations
                    </li>
                  </ul>
                  
                  <div className="mt-8" suppressHydrationWarning>
                    <Link 
                      href="/sign-up" 
                      className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                      suppressHydrationWarning
                    >
                      Create an Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 