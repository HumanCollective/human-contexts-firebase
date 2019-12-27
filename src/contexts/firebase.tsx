import React from 'react'
import firebaseClient from 'firebase/app'
import 'firebase/auth'

interface FirebaseContextValue {
  firebase?: typeof firebaseClient
  firebaseUser?: firebase.User | null
  isLoggedIn?: boolean
  isPointOfSales?: boolean
}

const defaults: FirebaseContextValue = {}

interface FirebaseContextProps {
  firebase: typeof firebaseClient
  configuration: any
}

export const FirebaseContext = React.createContext(defaults)

export const FirebaseProvider: React.FunctionComponent<FirebaseContextProps> = ({
  firebase,
  configuration,
  children,
}) => {
  const [value, setValue] = React.useState(defaults)

  React.useEffect(() => {
    firebase.initializeApp(configuration)
    firebase.auth().onAuthStateChanged(handleAuth)
  }, [])

  const handleAuth = async (user: firebase.User | null) => {
    setValue({
      firebase,
      firebaseUser: user,
      isLoggedIn: !!user,
    })
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}
