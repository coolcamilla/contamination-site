import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "./Header.css";

function Header({ user, onLoginClick, onNavigate }) {  // ← добавлен onNavigate
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const avatarRef = useRef(null);

    const handleLogOut = async () => {
        try {
            await signOut(auth);
            toast.info("Вы вышли из аккаунта", { position: "top-center" });
        } catch (error) {
            console.error("Ошибка выхода", error);
        }
    };

    const getInitials = () => {
        if (!user) return "?";
        if (user.displayName) {
            return user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return user.email ? user.email[0].toUpperCase() : "?";
    };

    const openMenu = () => {
        if (avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
        setMenuOpen(true);
    };

    const dropdownContent = (
        <div
            className="user-dropdown"
            style={{
                position: "fixed",
                top: menuPos.top,
                right: menuPos.right,
                zIndex: 999999,
            }}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
        >
            <div className="dropdown-item" onClick={() => { onNavigate('profile'); setMenuOpen(false); }}>
                О пользователе
            </div>
            <div className="dropdown-item" onClick={() => { onNavigate('reports'); setMenuOpen(false); }}>
                Заявки
            </div>
            <div className="dropdown-item">ЭКО Коины</div>
            <div className="dropdown-divider" />
            <div className="dropdown-item dropdown-logout" onClick={handleLogOut}>
                Выйти
            </div>
        </div>
    );

    return (
        <header className="header">
            <div className="header-logo" onClick={() => onNavigate('map')} style={{cursor: 'pointer'}}>
                <h1>ЭКО Патруль NN</h1>
            </div>

            <nav className="header-nav">
                <a href="/schedule" className="nav-link">График вывоза мусора</a>
                <a href="/contacts" className="nav-link">Контакты</a>
            </nav>

            <div className="header-auth">
                {user ? (
                    <div
                        className="user-menu"
                        onMouseEnter={openMenu}
                        onMouseLeave={() => setMenuOpen(false)}
                    >
                        <div className="user-avatar" ref={avatarRef}>
                            {getInitials()}
                        </div>

                        {menuOpen && createPortal(dropdownContent, document.body)}
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="login-btn">
                        ВОЙТИ
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
