import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Main';
import AboutUsPage from './pages/AboutUsPage';
import AuthForm from './pages/AuthPage';
import Profile from './pages/ProfilePage';
import Catalog_doc from './pages/Catalog_doc';
import Chat_page from './pages/ChatPage';
import Docs_look_toapr from './components/Look_doc';
import Generate from './components/generate';
import News from './components/News';
import DiagnosisDetail from './components/DiagnosisDetail';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutUsPage />} />
                    <Route path="/auth" element={<AuthForm />} />
                    <Route path="/login" element={<AuthForm />} />
                    <Route path="/register" element={<AuthForm />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/doctors" element={<Catalog_doc />} />
                    <Route path="/chat_doc" element={<Chat_page />} />
                    <Route path="/admin-doc" element={<Docs_look_toapr />} />
                    <Route path="/generate" element={<div className="medical-container"><Generate /></div>} />
                    <Route path="/news" element={<News />} />
                    <Route path="/diagnosis/:diagnosisId" element={<DiagnosisDetail />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;