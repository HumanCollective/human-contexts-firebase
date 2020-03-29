# `human-contexts-firebase`

Built by [Human](https://humancollective.co).

**Note: This project has been deprecated in favor of [`human-hooks-firebase`](https://www.npmjs.com/package/@humancollective/human-hooks-firebase) and [`human-hooks-firebase-native`](https://www.npmjs.com/package/@humancollective/human-hooks-firebase-native). Check out those projects if you haven't already.**

A set of simple helpers for accessing Firebase Firestore data in realtime using React Contexts.

This is a pattern we use frequently for quickly building prototypes, new features, and database connections at Human. It's great for prototyping and it doesn't introduce a lot of complicated boilerplate code.

Creating a secure realtime connection with Firestore is simple.

```tsx
// in /src/contexts/orders.ts
import { authedCollection } from '@humancollective/human-contexts-firebase'
import { Order } from '../types'

export const [OrdersContext, OrdersProvider] = authedCollection<Order>({
  getQueryRef: (firebase, uid) =>
    firebase
      .firestore()
      .collection('orders')
      .where('customerId', '==', uid),
})
```

With just a few of lines of code, we've created a new context with a Firestore listener. That listener will return an empty array unless the user is logged in. If they're logged in, it will return all of the orders they own _(**note** - this depends on your data model and security rules)_.

We now simply wrap the contents of the application that require access to our orders with the `<OrdersProvider />` and we'll be able to access the user's orders anywhere within it.

Here, for example, we can access the list of orders in the Account Page:

```tsx
// in /src/pages/account.tsx
import React from 'react'
import { OrdersContext } from '../contexts/orders'

export const AccountPage = () => {
  const orders = React.createContext(OrdersContext)
  return (
    <div>
      <h1>My Account</h1>
      {orders.map(({ reference, price }) => (
        <div key={reference}>
          {reference} - {price}
        </div>
      ))}
    </div>
  )
}
```

## Usage

### Installation

Install this library and firebase.

```sh
yarn add firebase @humancollective/human-contexts-firebase
```

Wrap your application in the `<FirebaseProvider />` and give it your firebase app configuration. You can nest this deeper in your application as long as it wraps all of the `human-contexts-firebase` providers.

```tsx
import React from 'react'
import firebase from 'firebase/app'
import { FirebaseProvider } from '@humancollective/human-contexts-firebase'

const MyApplication = ({ children }) => (
  <FirebaseProvider
    firebase={firebase}
    configuration={
      {
        // The credentials you use to access firebase
        // apiKey: "YOUR_API_KEY",
        // authDomain: "YOUR_AUTH_DOMAIN",
        // databaseURL: "YOUR_DATABASE_URL",
        // ...
      }
    }
  >
    {children}
  </FirebaseProvider>
)
```

## Creating a Context

To create an authenticated collection context, we import the `authedCollection` helper.

```tsx
import { authedCollection } from '@humancollective/human-contexts-firebase'
```

Now we can create a context and a provider for a collection. Let's create one for a series of posts that require an authenticated user.

```tsx
// /src/contexts/posts.ts
import { authedCollection } from '@humancollective/human-contexts-firebase'
import { Post } from '../types'

export const [PostsContext, PostsProvider] = authedCollection<Post>({
  getQueryRef: (firebase, uid) => firebase.firestore().collection('posts'),
})
```

Now let's wrap our application in the posts provider.

```tsx
import React from 'react'
import firebase from 'firebase/app'
import { FirebaseProvider } from '@humancollective/human-contexts-firebase'

// import the provider
import { PostsProvider } from '../contexts/posts'

const MyApplication = ({ children }) => (
  <FirebaseProvider firebase={firebase} configuration={YOUR_FIREBASE_CONFIG}>
    {/* ... and wrap the application with it */}
    <PostsProvider>{children}</PostsProvider>
  </FirebaseProvider>
)
```

Finally, we can access our posts anywhere nested under our layout:

```tsx
// in /src/pages/account.tsx
import React from 'react'
import { PostsContext } from '../contexts/posts'

export const AccountPage = () => {
  const posts = React.createContext(PostsContext)
  return (
    <div>
      <h1>Secret Posts</h1>
      {posts.map(({ name, excerpt, link }) => (
        <div key={link}>
          <a href={link}>{name}</a>
          <p>{excerpt}</p>
        </div>
      ))}
    </div>
  )
}
```

### Include IDs

We can include the Firebase IDs in the collection response by setting the `includeIds` flag to true when we create the collection context.

### Default Values

Default values can be specified using the `defaultValue` option when creating the collection context.
