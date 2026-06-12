import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import "./EcoCoins.css";

function EcoCoins() {
    const [totalCoins, setTotalCoins] = useState(0);
    const [history, setHistory] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) return;
        const userId = auth.currentUser.uid;

        const userUnsub = onSnapshot(doc(db, "Users", userId), (snap) => {
            if (snap.exists()) setTotalCoins(snap.data().points || 0);
        });

        const historyQuery = query(
            collection(db, "ecoCoinsHistory"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const historyUnsub = onSnapshot(historyQuery, (snapshot) => {
            setHistory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }, () => setLoading(false));

        const storesUnsub = onSnapshot(collection(db, "stores"), (snapshot) => {
            setStores(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => { userUnsub(); historyUnsub(); storesUnsub(); };
    }, []);

    if (loading) return <div className="ec-loading">Загрузка ЭКО Коинов…</div>;

    return (
        <div className="ec-page">
            {/* Секция 1: История — белый фон, фиксированная высота */}
            <section className="ec-section ec-section--white">
                <div className="ec-content">
                    <div className="ec-balance-card">
                        <div className="ec-balance-label">Ваши ЭКО Коины</div>
                        <div className="ec-balance-value">
                            {totalCoins}
                        </div>
                    </div>

                    <h2 className="ec-title">История начислений</h2>

                    {history.length === 0 ? (
                        <div className="ec-empty">
                            <p>Пока нет начислений</p>
                            <span>Создавайте заявки и получайте коины за одобрение!</span>
                        </div>
                    ) : (
                        <div className="ec-history-list">
                            {history.map((item) => (
                                <div key={item.id} className="ec-history-item">
                                    <div className="ec-history-main">
                                        <span className="ec-history-amount">+{item.amount}</span>
                                        <span className="ec-history-reason">{item.reason}</span>
                                    </div>
                                    <div className="ec-history-meta">
                                        <span>{item.createdAt?.toDate?.().toLocaleDateString("ru-RU")}</span>
                                        {item.reportId && (
                                            <span className="ec-history-report">
                                                Заявка №{item.reportId.slice(0, 6).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Секция 2: Магазины — зелёный фон */}
            <section className="ec-section ec-section--green">
                <div className="ec-content">
                    <h2 className="ec-title ec-title--light">Наши партнёры</h2>
                    
                    <div className="ec-partners-intro">
                        <p>
                            Мы гордимся тем, что проект «ЭкоПатруль НН» поддерживает социально ответственный бизнес Нижнего Новгорода. Наша партнерская сеть — это места, где забота о себе и планете стоит на первом месте. Именно здесь ваши экокоины превращаются в реальные скидки и приятные бонусы!
                        </p>
                    </div>

                    {stores.length === 0 ? (
                        <div className="ec-empty ec-empty--light">
                            <p>Пока нет партнёров</p>
                            <span>Скоро здесь появятся магазины для обмена коинов</span>
                        </div>
                    ) : (
                        <div className="ec-stores-scroll">
                            {stores.map((store) => (
                                <a
                                    key={store.id}
                                    href={store.website || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ec-store-card"
                                >
                                    <div className="ec-store-image">
                                        {store.photoUrl ? (
                                            <img src={store.photoUrl} alt={store.name} />
                                        ) : (
                                            <div className="ec-store-placeholder">🏪</div>
                                        )}
                                    </div>
                                    <div className="ec-store-info">
                                        <h3>{store.name}</h3>
                                        {store.description && (
                                            <p className="ec-store-desc">{store.description}</p>
                                        )}
                                        {store.bonus && (
                                            <div className="ec-store-bonus">
                                                <span className="ec-bonus-icon">🎁</span>
                                                <span>{store.bonus}</span>
                                            </div>
                                        )}
                                        <span className="ec-store-link">Перейти →</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default EcoCoins;