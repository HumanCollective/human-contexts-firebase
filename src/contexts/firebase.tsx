import React from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

export const initializeFirebase = firebase.initializeApp

export interface FirebaseContextValue {
  firebase?: typeof firebase
  firebaseUser?: firebase.User | null
  isLoggedIn?: boolean
  isPointOfSales?: boolean
}

const defaults: FirebaseContextValue = {}

export const FirebaseContext = React.createContext(defaults)

interface FirebaseContextProviderProps {
  config: any
}

export const FirebaseContextProvider: React.FunctionComponent<FirebaseContextProviderProps> = ({
  config,
  children,
}) => {
  const [value, setValue] = React.useState(defaults)

  React.useEffect(() => {
    firebase.initializeApp(config)
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
