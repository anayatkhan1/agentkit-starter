import { AuthLayout } from '@/components/auth-layout'
import { CustomSignUp } from '@/components/custom-sign-up'

export default function Page() {
  return (
    <AuthLayout>
      <CustomSignUp />
    </AuthLayout>
  )
}