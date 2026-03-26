import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Registration from './components/Auth';
import Map from './components/Map';
import MapComponent from './components/Map';

function App() {
  const [user, setUser] = useState(null);
  const [loaing, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loaing) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Registration />
  }

  return (
    <div>
      <h1>Добро пожаловать, {user.email}!</h1>
      <Map/>
    </div>
  );
}

export default App;
