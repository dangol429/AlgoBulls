// authReducer.ts
import {
  CREATE_USER_SUCCESS,
  LOGIN_USER_SUCCESS,
  LOGOUT_USER_SUCCESS,
  LOGIN_USER_FAILURE,
} from '../actions/authAction';

// User data type
export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

// Auth state type
export interface AuthState {
  user: UserData | null;
  error: string | null;
  isAuthenticated: boolean; // Add an isAuthenticated flag
}

// Initialize isAuthenticated and user from localStorage
const storedAuthState = localStorage.getItem('authState');
const initialAuthState = storedAuthState ? JSON.parse(storedAuthState) : { user: null, isAuthenticated: false };

const initialState: AuthState = {
  ...initialAuthState,
  error: null,
};

const authReducer = (state: AuthState = initialState, action: any) => {
  switch (action.type) {
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        error: null,
      };

    case LOGIN_USER_SUCCESS:
      // Update user and isAuthenticated on successful login and store in localStorage
      const updatedStateOnLogin = {
        user: action.payload,
        error: null,
        isAuthenticated: true,
      };
      localStorage.setItem('authState', JSON.stringify(updatedStateOnLogin));
      return updatedStateOnLogin;

    case LOGOUT_USER_SUCCESS:
      // Update user and isAuthenticated on logout and remove from localStorage
      const updatedStateOnLogout = {
        user: null,
        error: null,
        isAuthenticated: false,
      };
      localStorage.removeItem('authState');
      return updatedStateOnLogout;

    case LOGIN_USER_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default authReducer;
