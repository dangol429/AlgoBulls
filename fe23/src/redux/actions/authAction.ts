


// authActions.ts
import { getDocs, query, where, collection, addDoc } from 'firebase/firestore';
import { UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firestore } from '../../firebase';  // Assuming firestore is imported from firebase
import useCurrentUser from '../../firebase/currentUser'

// Action Types
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
export const LOGOUT_USER_SUCCESS = 'LOGOUT_USER_SUCCESS';
export const LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE';

// User data type
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Action Creators
const createUserSuccess = () => ({
  type: CREATE_USER_SUCCESS,
});

const loginUserSuccess = (user: UserData) => ({
  type: LOGIN_USER_SUCCESS,
  payload: user,
});

const logoutUserSuccess = () => ({
  type: LOGOUT_USER_SUCCESS,
});

const loginUserFailure = (error: string) => ({
  type: LOGIN_USER_FAILURE,
  payload: error,
});

export const createUser = (firestore: any, values: UserData) => async (dispatch:any) =>{
  console.log(values)
  try {
    // Check if the email already exists in the 'users' collection
    const emailQuerySnapshot = await getDocs(
      query(collection(firestore, 'users'), where('email', '==', values.email))
    );

    if (!emailQuerySnapshot.empty) {
      throw new Error('Email already taken. Please choose another email.');
    }

    // If the email is not taken, proceed to add the new document
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );

    // Access the user data from userCredential.user if needed

    // Add user data to Firestore
    await addDoc(collection(firestore, 'users'), {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
    });

    const userData = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
    };

    dispatch(createUserSuccess());
  } catch (error: any) {
    // Handle errors here
    throw new Error(`User creation failed: ${error.message}`);
  }
}

export const loginUser = (email: string, password: string) => async (dispatch: any) => {
  console.log(email + " " + password)
  try {
    // Sign in the user with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Retrieve user data from the 'users' collection
    const emailQuerySnapshot = await getDocs(query(collection(firestore, 'users'), where('email', '==', email)));

    if (emailQuerySnapshot.size > 0) {
      const userDoc = emailQuerySnapshot.docs[0];
      const userData = userDoc.data();

      const user: UserData = {
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        email: userData?.email || '',
        password: '',  // Assuming you have a password field in your UserData type
      };

      // If successful, you can perform additional actions or redirect the user
      console.log('Login successful!');
      dispatch(loginUserSuccess(user));
    }
    else { 
      console.log("no email query snapshot")
    }
  } catch (error: any) {
    // Handle login errors
    throw new Error(`Login error: ${error.message}`);
  }
}

export const logoutUser = () => async (dispatch: any) => {
  try {
    // Sign out the user
    await signOut(auth);

    // Additional actions after logout if needed
    console.log('Logout successful!');
    dispatch(logoutUserSuccess());
  } catch (error: any) {
    // Handle logout error
    console.error('Logout error:', error);
  }
};
