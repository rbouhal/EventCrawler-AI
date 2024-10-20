import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';  // Import required Firebase functions
import { provider } from '../../firebaseConfig';  // Import Google provider
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();  // Initialize the navigate function
  const auth = getAuth();  // Initialize Firebase Auth

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/find-events');  // Redirect to /find-events after login
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);  // Using Google Sign-In with Firebase v9
      console.log("User signed in: ", result.user);
      navigate('/find-events');  // Redirect to /find-events after Google sign-in
    } catch (error) {
      console.error("Error during Google sign-in: ", error);
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="input-field"
          />
          <button type="submit" className="login-button">Login</button>
        </form>

        <div className="divider">OR</div>

        <button onClick={handleGoogleSignIn} className="google-signin-button">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
