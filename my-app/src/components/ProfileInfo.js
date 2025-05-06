import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/profile.css';

const ProfileInfo = () => {
    const [profile, setProfile] = useState(null);
    const [doctorData, setDoctorData] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState(false);
    const [editingPatient, setEditingPatient] = useState(false);
    const [doctorFormData, setDoctorFormData] = useState({
        specialization: '',
        experience_years: '',
        bio: '',
        price: '',
    });
    const [patientFormData, setPatientFormData] = useState({
        phone: '',
        blood_type: '',
        allergies: '',
        chronic_conditions: '',
    });
    const [topUpAmount, setTopUpAmount] = useState('');
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [diagnosisHistory, setDiagnosisHistory] = useState([]);
    const [historyStats, setHistoryStats] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const itemsPerPage = 5;
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Нет токена авторизации');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5001/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(response.data);

                if (response.data.role === 'doctor' && response.data.id) {
                    try {
                        const doctorRes = await axios.get(`http://localhost:5001/api/doctor/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setDoctorData(doctorRes.data);
                        setDoctorFormData({
                            specialization: doctorRes.data.specialization || '',
                            experience_years: doctorRes.data.experience_years?.toString() || '',
                            bio: doctorRes.data.bio || '',
                            price: doctorRes.data.price?.toString() || '',
                        });
                    } catch (docErr) {
                        console.error("Error fetching doctor specific data:", docErr);
                    }
                }

                if (response.data.role === 'user' && response.data.patient) {
                    setPatientFormData({
                        phone: response.data.patient.phone || '',
                        blood_type: response.data.patient.blood_type || '',
                        allergies: response.data.patient.allergies || '',
                        chronic_conditions: response.data.patient.chronic_conditions || '',
                    });
                }

                if (user?.id) {
                    fetchDiagnosisHistory(user.id, token);
                    fetchDiagnosisStats(user.id, token);
                } else {
                    console.warn("User ID not available yet for history/stats fetch");
                }

            } catch (err) {
                console.error("Profile fetch error:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Ошибка авторизации. Пожалуйста, войдите снова.');
                    logout();
                } else {
                    setError('Ошибка при получении профиля');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchProfile();
        } else if (!localStorage.getItem('token')) {
            setLoading(false);
            console.log("User context not ready & no token found.");
        }
    }, [user, logout]);

    const fetchDiagnosisHistory = async (userId, token) => {
        if (!userId || !token) {
            console.warn("fetchDiagnosisHistory called without userId or token");
            return;
        }
        try {
            setHistoryLoading(true);
            const response = await axios.get('http://localhost:5001/api/diagnosis', {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 100, offset: 0, userId: userId }
            });
            setDiagnosisHistory(response.data.rows || []);
            setTotalPages(Math.ceil((response.data.rows || []).length / itemsPerPage));
        } catch (err) {
            console.error('Ошибка при загрузке истории диагнозов:', err.response || err);
            setError(prevError => prevError ? `${prevError}\nНе удалось загрузить историю диагнозов.` : 'Не удалось загрузить историю диагнозов.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchDiagnosisStats = async (userId, token) => {
        if (!userId || !token) {
            console.warn("fetchDiagnosisStats called without userId or token");
            return;
        }
        try {
            const response = await axios.get('http://localhost:5001/api/diagnosis/stats/user', {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId: userId },
            });
            setHistoryStats(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке статистики диагнозов:', err);
        }
    };

    const handleDoctorChange = (e) => {
        setDoctorFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDoctorSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const payload = {
                ...doctorFormData,
                experience_years: parseInt(doctorFormData.experience_years) || 0,
                price: parseFloat(doctorFormData.price) || 0,
            };
            await axios.put('http://localhost:5001/api/doctor/me', payload, { headers: { Authorization: `Bearer ${token}` } });
            const updatedDoctor = await axios.get('http://localhost:5001/api/doctor/me', { headers: { Authorization: `Bearer ${token}` } });
            setDoctorData(updatedDoctor.data);
            setDoctorFormData({
                specialization: updatedDoctor.data.specialization || '',
                experience_years: updatedDoctor.data.experience_years?.toString() || '',
                bio: updatedDoctor.data.bio || '',
                price: updatedDoctor.data.price?.toString() || '',
            });
            setEditingDoctor(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePatientChange = (e) => {
        setPatientFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePatientSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.put('http://localhost:5001/api/patient/me', patientFormData, { headers: { Authorization: `Bearer ${token}` } });
            setEditingPatient(false);
            setProfile(prev => ({
                ...prev,
                patient: { ...(prev?.patient || {}), ...patientFormData }
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleTopUp = async () => {
        if (!topUpAmount || parseFloat(topUpAmount) <= 0) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.post('http://localhost:5001/api/user/topup', { amount: parseFloat(topUpAmount) }, { headers: { Authorization: `Bearer ${token}` } });
            setShowTopUpModal(false);
            setTopUpAmount('');
            setProfile(prev => ({ ...prev, wallet: response.data.new_balance }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены? Аккаунт будет удален без возможности восстановления.')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.delete('http://localhost:5001/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
            logout();
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result);
            };
            reader.readAsDataURL(file);
            uploadAvatar(file);
        }
    };

    const uploadAvatar = async (file) => {
        if (!file) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await axios.post('http://localhost:5001/api/user/avatar', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(prev => ({ ...prev, avatar: response.data.avatarUrl }));
            const input = document.getElementById('avatar-upload');
            if (input) input.value = null;
        } catch (err) {
            console.error('Ошибка при загрузке аватара:', err);
            setPreviewAvatar(null);
        }
    };

    const handleDeleteDiagnosis = async (diagnosisId) => {
        if (!window.confirm('Удалить этот диагноз из истории?')) return;
        try {
            const token = localStorage.getItem('token');
            const currentUserId = user?.id;
            if (!token || !currentUserId) return;
            await axios.delete(`http://localhost:5001/api/diagnosis/${diagnosisId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDiagnosisHistory(currentUserId, token);
            fetchDiagnosisStats(currentUserId, token);
        } catch (err) {
            console.error('Ошибка при удалении диагноза:', err);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getCurrentPageDiagnoses = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return diagnosisHistory.slice(startIndex, endIndex);
    };

    const getRoleText = (role) => {
        switch(role) {
            case 'doctor': return 'Врач';
            case 'admin': return 'Администратор';
            default: return 'Пользователь';
        }
    };

    const getGenderText = (gender) => {
        switch (gender) {
            case 'M': return 'Мужской';
            case 'F': return 'Женский';
            default: return 'Не указан';
        }
    };

    if (loading) return <div className="loading-container"><p>Загрузка профиля...</p></div>;
    if (error && !profile) return <p className="error-text">{error}</p>;
    if (!profile) return <p>Не удалось загрузить профиль.</p>;

    const avatarSrc = previewAvatar || (profile.avatar
        ? profile.avatar.startsWith('http') ? profile.avatar : `http://localhost:5001${profile.avatar}`
        : `/images/default-${profile.role === 'doctor' ? 'doctor' : 'patient'}.png`);

    const currentDiagnoses = getCurrentPageDiagnoses();

    return (
        <div className="profile-wrapper">
            <div className="profile-avatar-container">
                <img src={avatarSrc} alt="Аватар профиля" className="profile-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src=`/images/default-${profile.role === 'doctor' ? 'doctor' : 'patient'}.png` }}/>
                <div className="avatar-upload">
                    <label htmlFor="avatar-upload" className="btn">Выбрать аватар</label>
                    <input type="file" id="avatar-upload" onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                </div>
            </div>

            <div className="diagnosis-history-sidebar">
                <h3>История диагнозов</h3>
                {historyLoading ? (
                    <p>Загрузка истории...</p>
                ) : diagnosisHistory.length > 0 ? (
                    <>
                        <div className="diagnosis-sidebar-list">
                            {currentDiagnoses.map(item => (
                                <div key={item.diagnosis_id} className="diagnosis-sidebar-item">
                                    <h4>{item.main_diagnosis ? item.main_diagnosis.split('.')[0] : 'Нет данных'}</h4>
                                    <div className="diagnosis-date">{new Date(item.created_at).toLocaleDateString('ru-RU')}</div>
                                    <button
                                        className="btn small view-btn"
                                        onClick={() => navigate(`/diagnosis/${item.diagnosis_id}`)}
                                    >
                                        Подробнее
                                    </button>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="diagnosis-pagination">
                                <button 
                                    className="pagination-btn" 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                >
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => handlePageChange(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    className="pagination-btn" 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                >
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p>История диагнозов пуста.</p>
                )}
            </div>

            <div className="profile-info">
                <div className="profile-block">
                    <h3>Данные пользователя</h3>
                    <p><strong>Имя:</strong> {profile.first_name || 'Не указано'} {profile.last_name || ''}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Роль:</strong> {getRoleText(profile.role)}</p>
                    <p><strong>Дата рождения:</strong> {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('ru-RU') : 'Не указана'}</p>
                    <p><strong>Пол:</strong> {getGenderText(profile.gender)}</p>
                    <p><strong>Баланс:</strong> {profile.wallet != null ? `${profile.wallet} ₸` : '0 ₸'}
                        <button className="btn topup-btn" onClick={() => setShowTopUpModal(true)}>Пополнить</button>
                    </p>
                </div>

                {profile.role === 'user' && (
                    <div className="profile-block">
                        <h3>Данные пациента</h3>
                        {editingPatient ? (
                            <div className="edit-form">
                                <label>Телефон: 
                                    <input 
                                        className="input-field" 
                                        name="phone" 
                                        value={patientFormData.phone} 
                                        onChange={handlePatientChange} 
                                        placeholder="Введите телефон"
                                    />
                                </label>
                                <label>Группа крови:
                                    <select 
                                        className="input-field" 
                                        name="blood_type" 
                                        value={patientFormData.blood_type} 
                                        onChange={handlePatientChange}
                                    >
                                        <option value="">Выберите группу крови</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </label>
                                <label>Аллергии: 
                                    <input 
                                        className="input-field" 
                                        name="allergies" 
                                        value={patientFormData.allergies} 
                                        onChange={handlePatientChange} 
                                        placeholder="Перечислите аллергии"
                                    />
                                </label>
                                <label>Хронические болезни: 
                                    <input 
                                        className="input-field" 
                                        name="chronic_conditions" 
                                        value={patientFormData.chronic_conditions} 
                                        onChange={handlePatientChange} 
                                        placeholder="Перечислите болезни"
                                    />
                                </label>
                                <div className="form-buttons">
                                    <button className="btn" onClick={handlePatientSave}>Сохранить</button>
                                    <button className="btn cancel-btn" onClick={() => setEditingPatient(false)}>Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p><strong>Телефон:</strong> {profile.patient?.phone || 'Не указан'}</p>
                                <p><strong>Группа крови:</strong> {profile.patient?.blood_type || 'Не указана'}</p>
                                <p><strong>Аллергии:</strong> {profile.patient?.allergies || 'Не указаны'}</p>
                                <p><strong>Хронические болезни:</strong> {profile.patient?.chronic_conditions || 'Не указаны'}</p>
                                <button className="btn" onClick={() => setEditingPatient(true)}>
                                    {profile.patient ? 'Редактировать' : 'Добавить данные пациента'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {profile.role === 'doctor' && (
                    <div className="profile-block">
                        <h3>Данные врача</h3>
                        {editingDoctor ? (
                            <div className="edit-form">
                                <label>Специализация: 
                                    <input 
                                        className="input-field" 
                                        name="specialization" 
                                        value={doctorFormData.specialization} 
                                        onChange={handleDoctorChange} 
                                    />
                                </label>
                                <label>Опыт (лет): 
                                    <input 
                                        className="input-field" 
                                        name="experience_years" 
                                        type="number" 
                                        min="0" 
                                        value={doctorFormData.experience_years} 
                                        onChange={handleDoctorChange} 
                                    />
                                </label>
                                <label>О себе: 
                                    <textarea 
                                        className="input-field" 
                                        name="bio" 
                                        value={doctorFormData.bio} 
                                        onChange={handleDoctorChange} 
                                        rows="3"
                                    ></textarea>
                                </label>
                                <label>Цена за приём (₸): 
                                    <input 
                                        className="input-field" 
                                        name="price" 
                                        type="number" 
                                        min="0" 
                                        step="100" 
                                        value={doctorFormData.price} 
                                        onChange={handleDoctorChange} 
                                    />
                                </label>
                                <div className="form-buttons">
                                    <button className="btn" onClick={handleDoctorSave}>Сохранить</button>
                                    <button className="btn cancel-btn" onClick={() => setEditingDoctor(false)}>Отмена</button>
                                </div>
                            </div>
                        ) : doctorData ? (
                            <>
                                <p><strong>Специализация:</strong> {doctorData.specialization || 'Не указана'}</p>
                                <p><strong>Опыт:</strong> {doctorData.experience_years != null ? `${doctorData.experience_years} лет` : 'Не указан'}</p>
                                <p><strong>О себе:</strong> {doctorData.bio || 'Нет информации'}</p>
                                <p><strong>Цена за приём:</strong> {doctorData.price != null ? `${doctorData.price} ₸` : 'Не указана'}</p>
                                <button className="btn" onClick={() => setEditingDoctor(true)}>Редактировать профиль врача</button>
                            </>
                        ) : <p>Загрузка данных врача...</p>}
                    </div>
                )}

                {profile.role === 'admin' && (
                    <div className="profile-block">
                        <h3>Панель администратора</h3>
                        <p>Для доступа к административным функциям перейдите в панель управления.</p>
                        <button className="btn" onClick={() => navigate('/admin')}>Перейти в панель управления</button>
                    </div>
                )}

                <div className="profile-block diagnosis-history">
                    <h3>Подробная статистика</h3>
                    {historyStats && (
                        <div className="history-stats">
                            <p><strong>Всего диагнозов:</strong> {historyStats.total_diagnoses}</p>
                            {historyStats.first_diagnosis_date &&
                                <p><strong>Первый диагноз:</strong> {new Date(historyStats.first_diagnosis_date).toLocaleDateString('ru-RU')}</p>
                            }
                            {historyStats.latest_diagnosis_date &&
                                <p><strong>Последний диагноз:</strong> {new Date(historyStats.latest_diagnosis_date).toLocaleDateString('ru-RU')}</p>
                            }
                        </div>
                    )}
                    {error && error.includes("историю диагнозов") && <p className="error-text small-error">{error}</p>}
                </div>

                <div className="profile-buttons">
                    <button className="btn danger-btn" onClick={handleDelete}>Удалить аккаунт</button>
                </div>
            </div>

            {showTopUpModal && (
                <div className="modal-overlay" onClick={() => setShowTopUpModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Пополнение баланса</h3>
                        <div className="form-group">
                            <label>Сумма пополнения</label>
                            <input 
                                className="input-field" 
                                type="number" 
                                value={topUpAmount} 
                                onChange={(e) => setTopUpAmount(e.target.value)} 
                                placeholder="Сумма в ₸" 
                                min="100" 
                                step="100"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="btn" 
                                onClick={handleTopUp} 
                                disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                            >
                                Пополнить
                            </button>
                            <button className="btn cancel-btn" onClick={() => setShowTopUpModal(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileInfo;