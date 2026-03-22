import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, getAuth } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";

function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("Sign Up done");
            setError('');
        }
        catch(error) {
            console.log(error.code);
            setError(error.message);
        }
    }

    const handleLogIn = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Log In done");
            setError('');
        }
        catch(error) {
            console.log(error.code);
            setError(error.message);
        }
    }

    return (
        <div>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleLogIn}>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите почту"
                required
                />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                />
                <button type="submit">Войти</button>
            </form>
            <button onClick={handleSignUp}>Зарегестрироваться</button>
        </div>
    );
}

export default Registration;