import "./Contacts.css";

function Contacts() {
    return (
        <div className="contacts-page">
            <section className="contacts-section">
                <div className="contacts-content">
                    <div className="contacts-card">
                        <h2 className="contacts-title">Контакты</h2>

                        <div className="contact-block">
                            <span className="contact-label">Региональный оператор</span>
                            <p className="contact-value contact-value--large">
                                «Нижэкология-НН»
                            </p>
                            <span className="contact-sub">
                                Обращение с твёрдыми коммунальными отходами
                            </span>
                        </div>

                        <div className="contact-divider" />

                        <div className="contact-block">
                            <span className="contact-label">Адрес офиса</span>
                            <p className="contact-value">
                                г. Нижний Новгород, ул. Ошарская, 95
                            </p>
                            <span className="contact-sub">
                                офисный центр Business Park, корпус А, этаж 6
                            </span>
                        </div>

                        <div className="contact-divider" />

                        <div className="contact-block">
                            <span className="contact-label">Время работы</span>
                            <div className="work-schedule">
                                <div className="schedule-row schedule-row--main">
                                    <span className="schedule-days">Пн — Чт</span>
                                    <span className="schedule-time">8:00 — 17:00</span>
                                </div>
                                <div className="schedule-row schedule-row--main">
                                    <span className="schedule-days">Пт</span>
                                    <span className="schedule-time">8:00 — 16:00</span>
                                </div>
                                <div className="schedule-row schedule-row--lunch">
                                    <span className="schedule-days">Обед</span>
                                    <span className="schedule-time">12:00 — 13:00</span>
                                </div>
                            </div>
                        </div>

                        <div className="contact-divider" />

                        <div className="contact-block">
                            <span className="contact-label">Телефон</span>
                            <a href="tel:+78312653000" className="contact-phone">
                                +7 (831) 26-53-000
                            </a>
                            <span className="contact-sub">многоканальный</span>
                        </div>

                        <div className="contact-links">
                            <a
                                href="https://nizhecologia-nn.ru"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link contact-link--primary"
                            >
                                🌐 Официальный сайт
                            </a>
                            <a
                                href="https://nizhecologia-nn.ru/request/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link contact-link--accent"
                            >
                                ✍️ Написать обращение
                            </a>
                            <a
                                href="https://vk.ru/nizhecologiann"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-link contact-link--social"
                            >
                                📱 Группа VK
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Contacts;
