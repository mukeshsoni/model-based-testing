This repository contains statechart based models for some common UI components and patterns. The statechart models are written in format which is understood by xstate.

Tests are then generated from the models using the @xstate/test library. The tests are run on some selected open source components which fit the models.

How to run the tests

Install dependencies - 

```
npm install
```

Start the server, which will render the components -

```
npm start

```

Run jest tests, written with @testing-library/react - 

```
npm run test -- --watch
```

Run cypress tests in headed mode, with full chrome UI

```
npm run cy
```
