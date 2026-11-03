import { createContext, useContext, useState } from 'react'

const SessionContext = createContext(null)
export function DemoSessionProvider({ children }) {
  const [user, setUser] = useState(null)
  return <SessionContext.Provider value={{ user, signIn: (profile) => setUser(profile), signOut: () => setUser(null) }}>{children}</SessionContext.Provider>
}
export const useDemoSession = () => useContext(SessionContext)
