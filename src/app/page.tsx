import { redirect } from 'next/navigation'

// Root redirects to the admin login
export default function Home() {
  redirect('/login')
}
