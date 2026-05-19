import './App.css';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Map from './components/Map';
import Header from './components/Header';
import ReportsHistory from './components/ReportsHistory';
import UserProfile from './components/UserProfile';
import EcoCoins from './components/EcoCoins';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const isCompany = userData?.role === "company";

  return (
    <div className='app'>
      <ToastContainer />
      <Header
        user={user}
        userData={userData}
        onLoginClick={() => setShowAuthModal(true)}
        onNavigate={setCurrentView}
      />

      {user && userData && !isCompany && currentView === 'map' && (
        <div className='greeting'>
          <div className='greeting-name'>Здравствуйте, {userData.firstName}!</div>
          <div className='greeting-hint'>Нажмите на карту, чтобы добавить метку</div>
        </div>
      )}

      <main className='main-content'>
        {currentView === 'map' && (
          <>
            <Map user={user} userData={userData} onRequireAuth={handleRequireAuth} />
            
            {/* Секция "О проекте" — только на главной */}
            <section className="about-section">
              <div className="about-content">
                <h2>О проекте</h2>
              </div>
            </section>
          </>
        )}
        {currentView === 'reports' && <ReportsHistory userData={userData} />}
        {currentView === 'profile' && <UserProfile user={user} userData={userData} />}
        {currentView === 'ecoCoins' && <EcoCoins />}
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
