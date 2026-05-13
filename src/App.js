import './App.css';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Map from './components/Map';
import Header from './components/Header';
import ReportsHistory from './components/ReportsHistory';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfile from './components/UserProfile';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState('map');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Ошибка загрузки данных пользователя:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // При выходе пользователя возвращаемся на карту
  useEffect(() => {
    if (!user) {
      setCurrentView('map');
    }
  }, [user]);

  const handleRequireAuth = () => {
    toast.info("Оставлять отметки могут только зарегистрированные пользователи", {
      position: "top-center",
      autoClose: 4000,
    });
    setShowAuthModal(true);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className='app'>
      <ToastContainer />
      <Header
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onNavigate={setCurrentView}
      />

      {user && userData && currentView === 'map' && (
        <div className='greeting'>
          Здравствуйте, {userData.firstName}!
        </div>
      )}

      <main className='main-content'>
        {currentView === 'map' && (
          <Map user={user} onRequireAuth={handleRequireAuth} />
        )}
        {currentView === 'profile' && <UserProfile user={user} userData={userData} />}
        {currentView === 'reports' && <ReportsHistory />}
      </main>

      {showAuthModal && (
        <div className='modal-overlay' onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAuthModal(false);
          }
        }}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <button className='modal-close' onClick={() => setShowAuthModal(false)}>×</button>
            <Auth key={showAuthModal} onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
