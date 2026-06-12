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
import Contacts from './components/Contacts';
import Schedule from './components/Schedule';
import Partners from './components/Partners';
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
            <section className="about-section" id="about-section">
              <div className="about-content">
                <h2>О проекте</h2>
                <p className="about-lead">
                  ЭкоПатруль НН — делаем Нижний чище вместе!
                </p>
                <p className="about-text">
                  Мы любим Нижний Новгород и хотим, чтобы наши дворы, улицы и парки всегда оставались чистыми. 
                  Но иногда классическая система дает сбой: мусоровоз приезжает по расписанию, а контейнер переполнился еще вчера.
                </p>
                <p className="about-text">
                  Именно поэтому мы создали «ЭкоПатруль НН» — умную краудсорсинговую платформу, которая объединяет неравнодушных жителей и городские службы. 
                  Мы верим, что технологии умного города работают лучше всего, когда в их основе лежат инициатива и забота самих горожан.
                </p>

                <h3 className="about-subtitle">Как это работает? Всего три простых шага:</h3>
                <ol className="about-steps">
                  <li>
                    <strong>Заметили проблему?</strong> Если мусорный бак переполнен, просто найдите его на нашей интерактивной карте.
                  </li>
                  <li>
                    <strong>Сделайте фото.</strong> Оцените уровень заполненности по шкале от 1 до 5 и прикрепите фотографию — это займет меньше минуты.
                  </li>
                  <li>
                    <strong>Мы передадим сигнал.</strong> Данные с нашей карты мгновенно синхронизируются с диспетчерскими системами регионального оператора ТКО. 
                    Мусоровоз скорректирует маршрут и приедет туда, где он действительно нужен прямо сейчас.
                  </li>
                </ol>

                <h3 className="about-subtitle">Помогайте городу и получайте за это бонусы!</h3>
                <p className="about-text">
                  Экологичный образ жизни должен поощряться. Поэтому за каждое полезное действие на платформе мы начисляем виртуальную валюту — экокоины.
                </p>
                <ul className="about-list">
                  <li>Вы получаете <strong>10 экокоинов</strong> за каждый подтвержденный сигнал о переполненном баке.</li>
                  <li>И еще <strong>5 экокоинов</strong>, если помогли модераторам подтвердить или опровергнуть сигнал другого пользователя.</li>
                  <li><strong>+20 экокоинов</strong> за каждого приглашённого друга! Просто поделитесь с ним своим персональным ID-аккаунта. 
                    Как только ваш друг укажет этот ID в специальном поле при регистрации, бонус автоматически зачислится на ваш баланс.</li>
                </ul>

                <h3 className="about-subtitle">На что потратить экокоины?</h3>
                <p className="about-text">
                  Мы формируем сообщество ответственного бизнеса в Нижнем Новгороде. Накопленные экокоины — это ваша реальная скидка у наших партнеров. Вы можете обменять их на:
                </p>
                <ul className="about-list">
                  <li>Повышенный тариф при сдаче картона и пластика в пунктах приема вторсырья «Исток».</li>
                  <li>Бесплатные поездки или отмену оплаты за старт у операторов кикшеринга Whoosh и Юрент.</li>
                  <li>Скидки и приятные бонусы в любимых эко-магазинах и веган-кафе нашего города.</li>
                </ul>

                <p className="about-closing">
                  Умный город начинается с каждого из нас. Присоединяйтесь к «ЭкоПатрулю НН»! 
                  Зовите друзей, копите экокоины и давайте вместе докажем, что поддерживать чистоту в городе — это просто, современно и выгодно.
                </p>
              </div>
            </section>
          </>
        )}
        {currentView === 'reports' && <ReportsHistory userData={userData} />}
        {currentView === 'profile' && <UserProfile user={user} userData={userData} />}
        {currentView === 'ecoCoins' && <EcoCoins />}
        {currentView === 'contacts' && <Contacts />}
        {currentView === 'schedule' && <Schedule />}
        {currentView === 'partners' && <Partners />}
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