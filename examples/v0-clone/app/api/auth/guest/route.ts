import { signIn } from '@/app/(auth)/auth'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectUrl = url.searchParams.get('redirectUrl')

  await signIn('guest', {
    redirect: false,
  })

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  redirect('/')
}
