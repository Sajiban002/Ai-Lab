import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faUser,
  faCalendarAlt,
  faVenusMars,
  faUserMd,
  faUserInjured,
  faChevronLeft,
  faChevronRight,
  faShieldAlt,
  faChartLine,
  faUserNurse,
  faMars,
  faVenus
} from '@fortawesome/free-solid-svg-icons';
import '../css/AuthPage.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: 'user',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // **IMPORTANT:  Change to your backend IP address OR keep localhost for local development**
  const backendURL = process.env.NODE_ENV === 'production'
    ? 'http://192.168.101.8:5001'  // Your computer's IP address
    : 'http://localhost:5001';    // Local development

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLogin(true);
    } else if (location.pathname === '/register') {
      setIsLogin(false);
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.role) {
        setError('Пожалуйста, выберите роль');
        return false;
      }
      return true;
    } else if (currentStep === 2) {
      if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender) {
        setError('Пожалуйста, заполните все личные данные');
        return false;
      }
      return true;
    } else if (currentStep === 3) {
      if (!formData.email || !formData.password) {
        setError('Пожалуйста, введите email и пароль');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setError('');
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin || validateStep()) {
      try {
        const url = isLogin
          ? `${backendURL}/api/user/login`
          : `${backendURL}/api/user/registration`;

        const dataToSend = isLogin ? {
          email: formData.email,
          password: formData.password
        } : formData;

        const response = await axios.post(url, dataToSend);

        const token = response.data?.token;
        if (!token) {
          setError('Ошибка: Токен не получен');
          return;
        }

        login(token, response.data?.user);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || `Ошибка ${isLogin ? 'авторизации' : 'регистрации'}: Попробуйте снова`);
      }
    }
  };

  const renderLoginForm = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Электронная почта</label>
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Введите ваш email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faLock} className="input-icon" />
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Введите ваш пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-options">
        <Link to="/forgot-password" className="forgot-password">Забыли пароль?</Link>
      </div>

      <button type="submit" className="auth-button">Войти</button>
    </form>
  );

  const renderRoleStep = () => (
    <div className="auth-form">
      <div className="form-group">
        <label>Выберите свою роль</label>
        <div className="role-selector">
          <div
            className={`role-option ${formData.role === 'user' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('user')}
          >
            <div className="role-icon">
              <FontAwesomeIcon icon={faUserInjured} />
            </div>
            <h4>Пациент</h4>
            <p>Создать аккаунт для доступа к сервисам</p>
          </div>
          <div
            className={`role-option ${formData.role === 'doctor' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('doctor')}
          >
            <div className="role-icon">
              <FontAwesomeIcon icon={faUserMd} />
            </div>
            <h4>Врач</h4>
            <p>Создать профессиональный аккаунт</p>
          </div>
        </div>
      </div>

      <div className="form-buttons">
        <button type="button" className="auth-button" onClick={nextStep}>
          Продолжить <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="auth-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">Имя</label>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Введите ваше имя"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Фамилия</label>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="text"
              id="last_name"
              name="last_name"
              placeholder="Введите вашу фамилию"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date_of_birth">Дата рождения</label>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="gender">Пол</label>
          <div className="input-wrapper gender-select-wrapper">
            <FontAwesomeIcon
              icon={formData.gender === 'M' ? faMars : formData.gender === 'F' ? faVenus : faVenusMars}
              className="input-icon"
            />
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{ paddingLeft: '32px' }}
            >
              <option value="">Выберите</option>
              <option value="M">Мужской</option>
              <option value="F">Женский</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-buttons">
        <button type="button" className="auth-button secondary" onClick={prevStep}>
          <FontAwesomeIcon icon={faChevronLeft} /> Назад
        </button>
        <button type="button" className="auth-button" onClick={nextStep}>
          Продолжить <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );

  const renderAccountCreationStep = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="reg-email">Электронная почта</label>
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          <input
            type="email"
            id="reg-email"
            name="email"
            placeholder="Введите ваш email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="reg-password">Пароль</label>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              id="reg-password"
              name="password"
              placeholder="Создайте пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-buttons">
        <button type="button" className="auth-button secondary" onClick={prevStep}>
          <FontAwesomeIcon icon={faChevronLeft} /> Назад
        </button>
        <button type="submit" className="auth-button">
          Зарегистрироваться
        </button>
      </div>
    </form>
  );

  const renderStepIndicator = () => (
    <div className="auth-step-indicator">
      <div className={`auth-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
      <div className="auth-step-line"></div>
      <div className={`auth-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
      <div className="auth-step-line"></div>
      <div className={`auth-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
    </div>
  );

  const renderRegistrationForm = () => {
    switch (currentStep) {
      case 1:
        return renderRoleStep();
      case 2:
        return renderPersonalInfoStep();
      case 3:
        return renderAccountCreationStep();
      default:
        return renderRoleStep();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Добро пожаловать!' : 'Создание аккаунта'}</h2>
          <p>
            {isLogin
              ? 'Войдите в свой аккаунт, чтобы получить доступ к сервисам'
              : 'Заполните форму для создания нового аккаунта'
            }
          </p>
          {!isLogin && renderStepIndicator()}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {isLogin ? renderLoginForm() : renderRegistrationForm()}

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрироваться</Link>
            </p>
          ) : (
            <p>
              Уже есть аккаунт? <Link to="/login" className="auth-link">Войти</Link>
            </p>
          )}
        </div>
      </div>

      <div className="unique-auth-info">
        <div className="unique-auth-info-content">
          <h3>{isLogin ? 'Преимущества нашего сервиса' : 'Почему стоит зарегистрироваться'}</h3>
          <ul className="unique-benefits-list">
            <li>
              <div className="unique-benefit-icon">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <div className="unique-benefit-text">
                <h4>Безопасность</h4>
                <p>Ваши данные надежно защищены и доступны только вам</p>
              </div>
            </li>
            <li>
              <div className="unique-benefit-icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="unique-benefit-text">
                <h4>Статистика здоровья</h4>
                <p>Отслеживайте свое состояние в режиме реального времени</p>
              </div>
            </li>
            <li>
              <div className="unique-benefit-icon">
                <FontAwesomeIcon icon={faUserNurse} />
              </div>
              <div className="unique-benefit-text">
                <h4>Консультации специалистов</h4>
                <p>Быстрый доступ к врачам различных специальностей</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;