import { useState } from 'react'
import { SessionContext } from './sessionContext.js'

export function DemoSessionProvider({ children }) {
  const [user, setUser] = useState(null)
  return <SessionContext.Provider value={{ user, signIn: (profile) => setUser(profile), signOut: () => setUser(null) }}>{children}</SessionContext.Provider>
}
