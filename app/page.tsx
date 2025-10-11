import { redirect } from 'next/navigation';

// Root page redirects to onboarding
export default function Home() {
  redirect('/onboarding');
}
