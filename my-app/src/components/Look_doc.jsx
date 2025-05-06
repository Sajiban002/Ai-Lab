import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/DOC.css'; 
import axios from 'axios';

function Docs_look_toapr() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [specialization, setSpecialization] = useState('');
    const [minExperience, setMinExperience] = useState('');
    const [maxExperience, setMaxExperience] = useState('');
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
                console.log('Отправляемые данные на сервер:', { name, specialization, minPrice, maxPrice, minExperience, maxExperience });
                const response = await fetch('http://localhost:5000/api/admin/get-notapproved', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        specialization,
                        minPrice,
                        maxPrice,
                        minExperience: minExperience || '',  // Передаем minExperience
                        maxExperience: maxExperience || ''   // Передаем maxExperience
                    }),
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
    }, [name, specialization, minPrice, maxPrice, minExperience, maxExperience]);  // Добавили minExperience и maxExperience в зависимости
     // Добавляем опыт в зависимости
    
    const handleFilterChange = (event) => {
        const { name, value } = event.target;
    
        if (name === 'specialization') {
            setSpecialization(value);
        } else if (name === 'minPrice') {
            setMinPrice(value);
        } else if (name === 'maxPrice') {
            setMaxPrice(value);
        } else if (name === 'name') {
            setName(value);
        } else if (name === 'minExperience') {
            setMinExperience(value); // Обновление для minExperience
        } else if (name === 'maxExperience') {
            setMaxExperience(value); // Обновление для maxExperience
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
        setMinExperience('');  // Сбрасываем минимальный опыт
        setMaxExperience('');  // Сбрасываем максимальный опыт
    };
    
    

    const handleMakeDoctor = async (doctor) => {
        try {
            // Получаем токен из localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Нет токена авторизации');
                return;
            }
    
            // Получаем данные профиля, чтобы получить user_id
            const profileResponse = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const CURRENT_USER_ID = profileResponse.data.id;  // Используем user_id из профиля
    
            // Подтверждение перед обновлением статуса доктора
            const confirmation = window.confirm(
                `Вы уверены, что хотите подтвердить доктора ${doctor.name_user} ${doctor.second_name}?`
            );
    
            if (!confirmation) return;
    
            // Данные для запроса на сервер
            const requestData = {
                userId: doctor.id,  // Отправляем именно userId для обновления записи
            };
    
            // Отправляем запрос на сервер для обновления статуса
            const response = await axios.post('http://localhost:5000/api/admin/approve-doc', requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,  // Передаем токен
                }
            });
    
            // Если ответ содержит имя и фамилию доктора, выводим их
            if (response.data.message === 'Доктор успешно одобрен') {
                const doctorName = response.data.doctorName; // Имя и фамилия из ответа сервера
    
                // Если всё успешно, обновляем список докторов и перезагружаем страницу
                alert(`Доктор ${doctor.name_user} ${doctor.second_name} успешно одобрен!`);
                setDoctors((prevDoctors) =>
                    prevDoctors.map((doctorItem) =>
                        doctorItem.id === doctor.id
                            ? { ...doctorItem, doctor: { ...doctorItem.doctor, is_approved: true } }
                            : doctorItem
                    )
                );
    
                // Перезагружаем страницу
                window.location.reload();
            } else {
                throw new Error(response.data.message || 'Не удалось подтвердить доктора');
            }
        } catch (err) {
            // Отображаем ошибку
            console.error('Ошибка при подтверждении доктора:', err);
            alert('Не удалось подтвердить доктора');
        }
    };
    

    // Frontend: handleRemoveDoctor
    const handleRemoveDoctor = async (doctor) => {
        try {
            // Получаем токен из localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Нет токена авторизации');
                return;
            }
    
            // Получаем данные профиля, чтобы удостовериться, что пользователь авторизован
            const profileResponse = await axios.get('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const CURRENT_USER_ID = profileResponse.data.id;  // Используем user_id из профиля
    
            // Подтверждение перед удалением
            const confirmation = window.confirm(
                `Вы уверены, что хотите удалить доктора ${doctor.name_user} ${doctor.second_name}?`
            );
            if (!confirmation) return;
    
            // Логируем doctor.id перед отправкой запроса
            console.log('ID доктора для удаления:', doctor.id);
    
            // Данные для запроса на сервер
            const requestData = {
                doctorId: doctor.id,  // Отправляем ID доктора для удаления
            };
    
            // Отправляем запрос на сервер для удаления доктора
            const response = await axios.post('http://localhost:5000/api/admin/del-doc', requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            // Если ответ содержит успешное сообщение
            if (response.data.message === 'Доктор успешно удален') {
                const doctorName = `${doctor.name_user} ${doctor.second_name}`; // Имя и фамилия доктора
    
                // Если всё успешно, обновляем список докторов и перезагружаем страницу
                alert(`Доктор ${doctorName} успешно удален!`);
                setDoctors((prevDoctors) =>
                    prevDoctors.filter((doctorItem) => doctorItem.id !== doctor.id)
                );
    
                // Перезагружаем страницу
                window.location.reload();
            } else {
                throw new Error(response.data.message || 'Не удалось удалить доктора');
            }
        } catch (err) {
            // Отображаем ошибку
            console.error('Ошибка при удалении доктора:', err);
            alert('Не удалось удалить доктора');
        }
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

                        {/* Новый фильтр для минимального опыта */}
                        <label className="label_select">
                            Мин. опыт (лет): <br />
                            <input
                                type="number"
                                name="minExperience"
                                value={minExperience}
                                onChange={handleFilterChange}
                                className='input_find_doc'
                                placeholder="Минимальный опыт"
                            />
                        </label>

                        {/* Новый фильтр для максимального опыта */}
                        <label className="label_select">
                            Макс. опыт (лет): <br />
                            <input
                                type="number"
                                name="maxExperience"
                                value={maxExperience}
                                onChange={handleFilterChange}
                                className='input_find_doc'
                                placeholder="Максимальный опыт"
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
                                <button onClick={() => handleMakeDoctor(doctor)}>Сделать доком</button>
                            </div>

                            <div className="Btn_doc">
                                <button onClick={() => handleRemoveDoctor(doctor)}>Удалить</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Docs_look_toapr;
