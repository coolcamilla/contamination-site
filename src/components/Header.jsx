import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import "./Header.css";

function Header({user, onLoginClick}) {
    const handleLogOut = async () => {
        try {
            await signOut(auth);
            toast.info("Вы вышли из аккаунта", {
                position: "top-center"
            });
        } catch (error) {
            console.error("Ошибка выхода", error);
        }
    };

    return (
        <header className="header">
            <div className="header-logo">
                <h1>Крутое Название</h1>
            </div>

            <nav className="header-nav">
                <a href="/schedule" className="nav-link">График вывоза мусора</a>
                <a href="/contacts" className="nav-link">Контакты</a>
            </nav>

            <div className="header-auth">
                {user ? (
                    <div className="user-menu">
                        <button onClick={handleLogOut} className="logout-btn">
                            ВЫЙТИ
                        </button>
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