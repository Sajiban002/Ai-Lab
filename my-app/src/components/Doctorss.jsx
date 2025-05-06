import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Docs() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialization, setSpecialization] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [name, setName] = useState('');
    const [showFilters, setShowFilters] = useState(false); // Для показа модального окна
    const navigate = useNavigate();
    
    const specialties = [
        { name: "Терапевт", id: 1 },
        { name: "Хирург", id: 2 },
        { name: "Кардиолог", id: 3 },
        { name: "Невролог", id: 4 },
        { name: "Офтальмолог", id: 5 },
        { name: "Дерматолог", id: 6 },
        { name: "Эндокринолог", id: 7 },
        { name: "Гинеколог", id: 8 },
        { name: "Уролог", id: 9 },
        { name: "Психотерапевт", id: 10 },
        { name: "Педиатр", id: 11 },
        { name: "Ортопед", id: 12 },
        { name: "Лор (отоларинголог)", id: 13 },
        { name: "Стоматолог", id: 14 },
        { name: "Аллерголог", id: 15 },
        { name: "Ревматолог", id: 16 },
        { name: "Врач общей практики", id: 17 },
        { name: "Онколог", id: 18 },
        { name: "Вирусолог", id: 19 },
        { name: "Пластический хирург", id: 20 }
    ];

    // Загружаем список докторов
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                console.log('Отправляемые данные на сервер:', { name, specialization, minPrice, maxPrice });
                const response = await fetch('http://localhost:5001/api/chat/get-approved', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, specialization, minPrice, maxPrice }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Ошибка при запросе:', errorData);
                    throw new Error(errorData.message || 'Ошибка при загрузке докторов');
                }

                const data = await response.json();
                setDoctors(data);
                setFilteredDoctors(data);
            } catch (error) {
                setError(error.message);
                console.error('Ошибка при загрузке докторов:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [name, specialization, minPrice, maxPrice]);

    // Обработка создания чата с врачом
    const handleCreateChat = async (doctor) => {
        try {
          // Получаем токен из localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Нет токена авторизации');
            return;
          }
      
          // Получаем данные профиля, чтобы получить user_id
          const profileResponse = await axios.get('http://localhost:5001/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          const CURRENT_USER_ID = profileResponse.data.id;  // Используем user_id из профиля
      
          // Подтверждение перед созданием чата
          const confirmation = window.confirm(
            `Вы уверены, что хотите начать консультацию с врачом ${doctor.name_user} ${doctor.second_name}?`
          );
      
          if (!confirmation) return;
      
          // Данные для запроса на сервер
          const requestData = {
            doctor_id: doctor.id,
            doctor_name: doctor.name_user,
            doctor_second_name: doctor.second_name,
            user_id: CURRENT_USER_ID,
          };
      
          // Отправляем запрос на сервер для создания чата
          const response = await fetch('http://localhost:5001/api/chat/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,  // Передаем токен
            },
            body: JSON.stringify(requestData),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Ошибка при запросе:', errorData);
            throw new Error(errorData.message || 'Не удалось создать чат');
          }
      
          const data = await response.json();
      
          if (data.success) {
            // Если всё успешно, перенаправляем на чат
            navigate('/chat_doc');
          } else {
            throw new Error(data.message || 'Ошибка при создании чата');
          }
        } catch (error) {
          // Отображаем ошибку
          alert('Ошибка: ' + error.message);
        }
      };
      
      


    // Обработка изменения фильтров
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        if (name === 'specialization') {
            setSpecialization(value);
        } else if (name === 'minPrice') {
            setMinPrice(value);
        } else if (name === 'maxPrice') {
            setMaxPrice(value);
        } else if (name === 'name') {
            setName(value); // Для изменения имени
        }
    };

    // Открыть/закрыть модальное окно
    const toggleFiltersModal = () => {
        setShowFilters(!showFilters);
    };

    // Сбросить фильтры
    const resetFilters = () => {
        setName('');
        setSpecialization('');
        setMinPrice('');
        setMaxPrice('');
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div className="Clogddd">
            <label>
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleFilterChange}
                    placeholder="Поиск по имени"
                    className='input_find_doc'
                />
            </label>
            {/* Кнопка для открытия модального окна с фильтрами */}
            <button onClick={toggleFiltersModal} className='btn_filters'>Фильтры</button>

            {/* Модальное окно для фильтров */}
            {showFilters && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Фильтры</h3>

                        <label className="label_select">
                            Специализация:
                            <select
                                className="select_specialization"
                                name="specialization"
                                value={specialization}
                                onChange={handleFilterChange}
                            >
                                <option value="">Выберите специализацию</option>
                                {specialties.map((spec) => (
                                    <option key={spec.id} value={spec.name}>
                                        {spec.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="label_select">
                            Мин. цена: <br />
                            <input
                                type="number"
                                name="minPrice"
                                value={minPrice}
                                onChange={handleFilterChange}
                                className='input_find_doc'
                            />
                        </label>

                        <label className="label_select">
                            Макс. цена:<br />
                            <input
                                type="number"
                                name="maxPrice"
                                value={maxPrice}
                                onChange={handleFilterChange}
                                className='input_find_doc'
                            />
                        </label>

                        {/* Кнопка сброса фильтров */}
                        <button onClick={resetFilters} className='btn_filters'>Сбросить фильтры</button>
                        <button onClick={toggleFiltersModal} className='btn_filters'>Закрыть</button>
                    </div>
                </div>
            )}

            {/* Список докторов */}
            <div className='Doctors_toREC'>
                <ul>
                    {filteredDoctors.map((doctor) => (
                        <li key={doctor.id} className="doctor_card">
                            <p><strong>{doctor.name_user} {doctor.second_name}</strong></p>
                            <p>Специализация: {doctor.doctor?.specialization}</p>
                            <p>Опыт: {doctor.doctor?.experience_years} лет</p>
                            <p>О докторе: {doctor.doctor?.bio}</p>
                            <p>Цена приёма: {doctor.doctor?.price}₽</p>

                            <div className="Btn_doc">
                                <button onClick={() => handleCreateChat(doctor)}>
                                    Записаться ({doctor.doctor?.price}₸)
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}

export default Docs;
