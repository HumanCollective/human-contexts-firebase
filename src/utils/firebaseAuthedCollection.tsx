import React from 'react'
import firebaseClient from 'firebase/app'
import 'firebase/firestore'

import { FirebaseContext } from '../contexts'

type FirebaseClient = typeof firebaseClient

interface FirebaseAuthedCollectionProviderProps<T = any> {
  defaultValue: T[]
  getQueryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.CollectionReference
  children: React.ReactNode
  Provider: React.Provider<T[]>
}

const FirebaseAuthedCollectionProvider = <T extends unknown>({
  defaultValue,
  getQueryRef,
  children,
  Provider,
}: FirebaseAuthedCollectionProviderProps<T>) => {
  const [value, setValue] = React.useState(defaultValue)
  const [listener, setListener] = React.useState({ unsubscribe: () => {} })
  const { firebase, firebaseUser } = React.useContext(FirebaseContext)

  React.useEffect(() => {
    if (!firebase) {
      return
    }
    listener.unsubscribe()
    if (firebaseUser) {
      const off = getQueryRef(firebase).onSnapshot(onUpdate)
      setListener({ unsubscribe: off })
      return off
    }
  }, [firebase, firebaseUser])

  const onUpdate = async (querySnap: firebase.firestore.QuerySnapshot) => {
    const allDocs = querySnap.docs
    const nextValue: T[] = []
    for (const doc of allDocs) {
      nextValue.push(doc.data() as T)
    }
    setValue(nextValue)
  }

  return <Provider value={value}>{children}</Provider>
}

export const firebaseAuthedCollection = <T extends unknown>({
  defaultValue = [],
  getQueryRef,
}: {
  defaultValue?: T[]
  getQueryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.CollectionReference
}) => {
  const Context: React.Context<T[]> = React.createContext(defaultValue)

  const Provider: React.FunctionComponent = ({ children }) => (
    <FirebaseAuthedCollectionProvider<T>
      Provider={Context.Provider}
      defaultValue={defaultValue}
      getQueryRef={getQueryRef}
    >
      {children}
    </FirebaseAuthedCollectionProvider>
  )

  return {
    Context,
    Provider,
  }
}
