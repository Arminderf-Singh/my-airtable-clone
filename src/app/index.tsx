import { signIn, signOut, useSession } from "next-auth/react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <button onClick={() => signOut()}>Sign Out</button>
    )
  }
  return (
    <button onClick={() => signIn("google")}>Sign in with Google</button>
  )
}
