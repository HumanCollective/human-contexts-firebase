import React from 'react'
import firebaseClient from 'firebase/app'

import { FirebaseContext } from '../contexts'

type FirebaseClient = typeof firebaseClient

export const firebaseCollection = <T extends unknown>({
  defaultValue = [],
  queryRef,
}: {
  defaultValue?: T[]
  queryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.CollectionReference
}) => {
  const Context = React.createContext(defaultValue as T[])
  const Provider: React.FunctionComponent = ({ children }) => {
    const [value, setValue] = React.useState(defaultValue)
    const [listener, setListener] = React.useState({ unsubscribe: () => {} })
    const { firebase } = React.useContext(FirebaseContext)

    React.useEffect(() => {
      if (!firebase) {
        return
      }
      listener.unsubscribe()
      const off = queryRef(firebase).onSnapshot(onUpdate)
      setListener({ unsubscribe: off })
      return off
    }, [firebase])

    const onUpdate = async (querySnap: firebase.firestore.QuerySnapshot) => {
      const allDocs = querySnap.docs
      const nextValue: T[] = []
      for (const doc of allDocs) {
        nextValue.push(doc.data() as T)
      }
      setValue(nextValue)
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  return {
    Context,
    Provider,
  }
}
