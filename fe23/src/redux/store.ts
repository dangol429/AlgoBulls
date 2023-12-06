import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers/rootReducer'; // Import your root reducer
import thunk from 'redux-thunk';

// Define the Redux DevTools compose function
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer, 
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
