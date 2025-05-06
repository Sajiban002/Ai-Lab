import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/Header-Footer.css';
import logo from '../images/med.avif';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Автоматически закрывать меню при изменении маршрута
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="medical-bg-element"></div>
      <nav className="nav">
        <Link to="/" className="logo" onClick={toggleMenu}>
          <img src={logo} alt="МедЦентр" className="logo-img" />
        </Link>

        <div className={`burger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className={`overlay ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>

        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" onClick={toggleMenu} className={location.pathname === '/' ? 'active' : ''}>
              Главная
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={toggleMenu} className={location.pathname === '/about' ? 'active' : ''}>
              О нас
            </Link>
          </li>


          <li>
            <Link to="/news" onClick={toggleMenu} className={location.pathname === '/news' ? 'active' : ''}>
              Новости
            </Link>
          </li>
          <li>
            <Link to="/generate" onClick={toggleMenu} className={location.pathname === '/ai' ? 'active' : ''}>
              ИИ-консультант
            </Link>
          </li>

          {user?.role === 'user' && (
            <li>
              <Link to="/doctors" onClick={toggleMenu} className={location.pathname === '/doctors' ? 'active' : ''}>
                Врачи
              </Link>
            </li>
          )}    
          <li>
            <Link to="/chat_doc" onClick={toggleMenu} className={location.pathname === '/chat_doc' ? 'active' : ''}>
              Контакты
            </Link>
          </li>

          {!user ? (
            <>
              <li>
                <Link to="/login" onClick={toggleMenu} className={location.pathname === '/login' ? 'active' : ''}>
                  Вход
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={toggleMenu} className={location.pathname === '/register' ? 'active' : ''}>
                  Регистрация
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/profile" onClick={toggleMenu} className={location.pathname === '/profile' ? 'active' : ''}>
                  Профиль
                </Link>
              </li>
              <li>
                <a href="#" 
                   className="logout-link"
                   onClick={(e) => {
                     e.preventDefault();
                     toggleMenu();
                     handleLogout();
                   }}>
                  Выход
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;