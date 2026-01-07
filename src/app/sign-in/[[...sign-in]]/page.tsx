import { AuthLayout } from '@/components/auth-layout'
import { CustomSignIn } from '@/components/custom-sign-in'

export default function Page() {
  return (
    <AuthLayout>
      <CustomSignIn />
    </AuthLayout>
  )
}