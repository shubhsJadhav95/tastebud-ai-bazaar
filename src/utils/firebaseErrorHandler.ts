import { FirebaseError } from 'firebase/app';

export type FirebaseErrorCode = 
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/operation-not-allowed'
  | 'auth/too-many-requests'
  | 'permission-denied'
  | 'unauthenticated'
  | string;

export interface ErrorMessage {
  title: string;
  message: string;
  code: FirebaseErrorCode;
}

export const getFirebaseErrorMessage = (error: unknown): ErrorMessage => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return {
          title: 'Invalid Email',
          message: 'The email address is not valid.',
          code: error.code
        };
      case 'auth/user-disabled':
        return {
          title: 'Account Disabled',
          message: 'This account has been disabled. Please contact support.',
          code: error.code
        };
      case 'auth/user-not-found':
        return {
          title: 'User Not Found',
          message: 'No account found with this email address.',
          code: error.code
        };
      case 'auth/wrong-password':
        return {
          title: 'Wrong Password',
          message: 'The password is incorrect.',
          code: error.code
        };
      case 'auth/email-already-in-use':
        return {
          title: 'Email In Use',
          message: 'This email address is already in use.',
          code: error.code
        };
      case 'auth/weak-password':
        return {
          title: 'Weak Password',
          message: 'The password is too weak. Please use a stronger password.',
          code: error.code
        };
      case 'auth/operation-not-allowed':
        return {
          title: 'Operation Not Allowed',
          message: 'This operation is not allowed. Please contact support.',
          code: error.code
        };
      case 'auth/too-many-requests':
        return {
          title: 'Too Many Requests',
          message: 'Too many requests. Please try again later.',
          code: error.code
        };
      case 'permission-denied':
        return {
          title: 'Permission Denied',
          message: 'You do not have permission to perform this action.',
          code: error.code
        };
      case 'unauthenticated':
        return {
          title: 'Unauthenticated',
          message: 'You must be logged in to perform this action.',
          code: error.code
        };
      default:
        return {
          title: 'Error',
          message: error.message || 'An unexpected error occurred.',
          code: error.code
        };
    }
  }

  // Handle non-Firebase errors
  const err = error as Error;
  return {
    title: 'Error',
    message: err.message || 'An unexpected error occurred.',
    code: 'unknown'
  };
};

export const isFirebaseError = (error: unknown): error is FirebaseError => {
  return error instanceof FirebaseError;
}; 