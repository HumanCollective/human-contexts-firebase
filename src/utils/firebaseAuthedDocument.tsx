import React from 'react'
import firebaseClient from 'firebase/app'

import { FirebaseContext } from '../contexts'

type FirebaseClient = typeof firebaseClient

export const firebaseAuthedCollection = <T extends unknown>({
  defaultValue,
  queryRef,
}: {
  defaultValue: T
  queryRef: (
    firebaseClient: FirebaseClient,
  ) => firebase.firestore.DocumentReference
}) => {
  const Context = React.createContext(defaultValue)
  const Provider: React.FunctionComponent = ({ children }) => {
    const [value, setValue] = React.useState(defaultValue)
    const [listener, setListener] = React.useState({ unsubscribe: () => {} })
    const { firebase, firebaseUser } = React.useContext(FirebaseContext)

    React.useEffect(() => {
      if (!firebase) {
        return
      }
      listener.unsubscribe()
      if (firebaseUser) {
        const off = queryRef(firebase).onSnapshot(onUpdate)
        setListener({ unsubscribe: off })
        return off
      }
    }, [firebase, firebaseUser])

    const onUpdate = async (doc: firebase.firestore.DocumentSnapshot) => {
      setValue(doc.data() as T)
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  return {
    Context,
    Provider,
  }
}
