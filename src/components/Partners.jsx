import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./Partners.css";

function Partners() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storesUnsub = onSnapshot(collection(db, "stores"), (snapshot) => {
            setStores(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, () => setLoading(false));

        return () => storesUnsub();
    }, []);

    if (loading) return <div className="partners-loading">Загрузка партнёров…</div>;

    return (
        <section className="partners-section">
            <div className="partners-content">
                <h2>Наши партнёры</h2>
                <p className="partners-lead">
                    Мы формируем сообщество ответственного бизнеса в Нижнем Новгороде. 
                    Накопленные экокоины — это ваша реальная скидка у наших партнёров.
                </p>

                {stores.length === 0 ? (
                    <div className="partners-empty">
                        <p>Пока нет партнёров</p>
                        <span>Скоро здесь появятся магазины для обмена коинов</span>
                    </div>
                ) : (
                    <div className="partners-grid">
                        {stores.map((store) => (
                            <a
                                key={store.id}
                                href={store.website || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="partner-card"
                            >
                                <div className="partner-image">
                                    {store.photoUrl ? (
                                        <img src={store.photoUrl} alt={store.name} />
                                    ) : (
                                        <div className="partner-placeholder">🏪</div>
                                    )}
                                </div>
                                <div className="partner-info">
                                    <h3 className="partner-name">{store.name}</h3>
                                    {store.description && (
                                        <p className="partner-description">{store.description}</p>
                                    )}
                                    {store.bonus && (
                                        <div className="partner-bonus">
                                            <span className="partner-bonus-icon">🎁</span>
                                            <span>{store.bonus}</span>
                                        </div>
                                    )}
                                    <span className="partner-link">Перейти →</span>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                <div className="partners-cta">
                    <p>Хотите стать партнёром? Свяжитесь с нами через раздел «Контакты».</p>
                </div>
            </div>
        </section>
    );
}

export default Partners;
