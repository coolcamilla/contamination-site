import "./Schedule.css";

function Schedule() {
    return (
        <div className="schedule-page">
            <section className="schedule-section">
                <div className="schedule-content">
                    <div className="schedule-card">
                        <h2 className="schedule-title">График вывоза мусора</h2>

                        <div className="schedule-intro">
                            <span className="schedule-badge">ТКО</span>
                            <p className="schedule-intro-text">
                                Региональный оператор вправе осуществлять вывоз твёрдых коммунальных отходов
                                <strong> с 7:00 до 23:00</strong>
                            </p>
                        </div>

                        <div className="schedule-modes">
                            <div className="mode-card mode-card--warm">
                                <div className="mode-icon">☀️</div>
                                <div className="mode-header">
                                    <h3>Тёплый период</h3>
                                    <span className="mode-temp">выше +5 °C</span>
                                </div>
                                <div className="mode-divider" />
                                <div className="mode-frequency">
                                    <span className="mode-number">1</span>
                                    <div className="mode-desc">
                                        <span className="mode-period">раз в сутки</span>
                                        <span className="mode-condition">
                                            при среднесуточной температуре выше +5 °C в течение 3 суток
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mode-card mode-card--cold">
                                <div className="mode-icon">❄️</div>
                                <div className="mode-header">
                                    <h3>Холодный период</h3>
                                    <span className="mode-temp">+4 °C и ниже</span>
                                </div>
                                <div className="mode-divider" />
                                <div className="mode-frequency">
                                    <span className="mode-number">1</span>
                                    <div className="mode-desc">
                                        <span className="mode-period">раза в 3 дня</span>
                                        <span className="mode-condition">
                                            при среднесуточной температуре +4 °C и ниже в течение 3 суток
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="schedule-note">
                            <span className="note-icon">ⓘ</span>
                            <p>
                                Температура определяется как среднесуточная за последние 3 суток.
                                Региональный оператор — «Нижэкология-НН».
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Schedule;
