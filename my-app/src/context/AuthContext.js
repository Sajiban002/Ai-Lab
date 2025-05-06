import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Используется для декодирования без проверки подписи

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // При загрузке приложения проверяем токен в localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token); // Декодирует payload, НЕ ПРОВЕРЯЕТ ПОДПИСЬ
        // Проверка, что декодированный объект валиден
        if (!decoded || typeof decoded !== 'object' || !decoded.id) { // Добавил проверку на decoded.id
          console.error('Invalid decoded token structure in localStorage:', decoded);
          logout(); // Выходим, если структура токена неверная
          return;
        }
        // Сохраняем декодированные данные и сам токен в состоянии
        setUser({ ...decoded, token });
        console.log('AuthContext: User set from localStorage token', { ...decoded });
      } catch (error) {
        console.error('AuthContext: Failed to decode token from localStorage:', error);
        logout(); // Выходим, если токен не декодируется
      }
    }
  }, []);

  // Функция для логина: получает токен от API
  const login = (token) => {
    if (!token) {
      console.error('AuthContext: Login attempt with missing token');
      return;
    }

    try {
      const decoded = jwtDecode(token); // Снова декодируем для получения данных пользователя
       // Проверка, что декодированный объект валиден
       if (!decoded || typeof decoded !== 'object' || !decoded.id) { // Добавил проверку на decoded.id
        console.error('AuthContext: Invalid decoded token structure during login:', decoded);
        logout(); // Не логинимся с неверным токеном
        return;
      }
      // 1. Сохраняем ОРИГИНАЛЬНЫЙ токен в localStorage - это КЛЮЧЕВОЕ для отправки на бэкенд
      localStorage.setItem('token', token);
      // 2. Устанавливаем состояние пользователя с декодированными данными и токеном
      setUser({ ...decoded, token });
      console.log('AuthContext: User logged in successfully', { ...decoded });
    } catch (error) {
      console.error('AuthContext: Error decoding token during login:', error);
      // Не устанавливаем пользователя и не сохраняем токен, если он не декодируется
    }
  };

  // Функция для логаута
  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('token'); // Удаляем токен
    setUser(null); // Сбрасываем состояние пользователя
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);