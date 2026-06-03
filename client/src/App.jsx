import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfileSetupPage from './pages/ProfileSetupPage.jsx';
import OAuthSuccessPage from './pages/OAuthSuccessPage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import FilmsPage from './pages/FilmsPage.jsx';
import WatchlistPage from './pages/WatchlistPage.jsx';
import MyListsPage from './pages/MyListsPage.jsx';
import ListDetailPage from './pages/ListDetailPage.jsx';
import EditListPage from './pages/EditListPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import DiaryPage from './pages/DiaryPage.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth/success" element={<OAuthSuccessPage />} />
        <Route path="/film/:id" element={<MovieDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/films" element={<FilmsPage />} />
        <Route path="/lists/:id" element={<ListDetailPage />} />
        <Route path="/u/:username" element={<UserProfilePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/diary/:username" element={<DiaryPage />} />

        {/* Protected */}
        <Route path="/setup-profile" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
        <Route path="/lists" element={<ProtectedRoute><MyListsPage /></ProtectedRoute>} />
        <Route path="/lists/:id/edit" element={<ProtectedRoute><EditListPage /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><DiaryPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}