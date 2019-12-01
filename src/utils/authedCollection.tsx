import React from 'react'
import firebaseClient from 'firebase/app'
import 'firebase/firestore'

import { FirebaseContext } from '../contexts'

type FirebaseClient = typeof firebaseClient

interface AuthedCollectionProviderProps<T = any> {
  defaultValue: T[]
  getQueryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.CollectionReference
  children: React.ReactNode
  Provider: React.Provider<T[]>
  includeIds?: boolean
}

const AuthedCollectionProvider = <T extends unknown>({
  defaultValue,
  getQueryRef,
  children,
  Provider,
  includeIds,
}: AuthedCollectionProviderProps<T>) => {
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
      nextValue.push(({
        ...(includeIds && { id: doc.id }),
        ...doc.data(),
      } as unknown) as T)
    }
    setValue(nextValue)
  }

  return <Provider value={value}>{children}</Provider>
}

export const authedCollection = <T extends unknown>({
  defaultValue = [],
  getQueryRef,
  includeIds,
}: {
  defaultValue?: T[]
  getQueryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.CollectionReference
  includeIds?: boolean
}) => {
  const Context: React.Context<T[]> = React.createContext(defaultValue)

  const Provider: React.FunctionComponent = ({ children }) => (
    <AuthedCollectionProvider<T>
      Provider={Context.Provider}
      defaultValue={defaultValue}
      getQueryRef={getQueryRef}
      includeIds={includeIds}
    >
      {children}
    </AuthedCollectionProvider>
  )

  return [Context, Provider] as [
    React.Context<T[]>,
    React.FunctionComponent<{}>,
  ]
}
