import MainLayout from '@/components/layout/MainLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPassword() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-12" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          <div className="max-w-md mx-auto" suppressHydrationWarning>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center" suppressHydrationWarning>
              Reset Your Password
            </h1>
            <p className="text-gray-600 mb-8 text-center" suppressHydrationWarning>
              Enter your email address, and we'll send you a link to reset your password.
            </p>
            
            <div className="bg-white rounded-lg shadow-md p-6" suppressHydrationWarning>
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 