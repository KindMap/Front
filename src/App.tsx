import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { HighContrastProvider } from './contexts/HighContrastContext';
import { VoiceGuideProvider } from './contexts/VoiceGuideContext';
import { MapPage } from './components/MapPage';
import { RouteSearchPage } from './components/RouteSearchPage';
import { UserTypeSelectionPage } from './components/UserTypeSelectionPage';
import { WheelchairRouteSearchPage } from './components/WheelchairRouteSearchPage';
import { InfantRouteSearchPage } from './components/InfantRouteSearchPage';
import { ElderlyRouteSearchPage } from './components/ElderlyRouteSearchPage';
import { PregnantRouteSearchPage } from './components/PregnantRouteSearchPage';
import { LowVisionRouteSearchPage } from './components/LowVisionRouteSearchPage';
import { FavoritesPage } from './components/FavoritesPage';
import { LoginPage } from './components/LoginPage';
import { Route as RouteType, Favorite } from './types';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAvx8bGk5wtq5tTOE5q2S06SkLZJakUItM';
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

function AppContent() {
  const location = useLocation();
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);

  useEffect(() => {
    if (location.state?.selectedRoute) {
      setSelectedRoute(location.state.selectedRoute);
    }
  }, [location]);

  const handleRouteSelect = (route: RouteType) => {
    // Check if we're adding to favorites
    const searchParams = new URLSearchParams(location.search);
    const addToFavorites = searchParams.get('addToFavorites') === 'true';

    if (addToFavorites) {
      // Add to favorites in localStorage
      const stored = localStorage.getItem('favorites');
      const favorites: Favorite[] = stored ? JSON.parse(stored) : [];
      const newFavorite: Favorite = {
        ...route,
        addedAt: new Date(),
      };
      
      // Check if already exists
      if (!favorites.some(f => f.id === route.id && f.departure === route.departure && f.destination === route.destination)) {
        favorites.push(newFavorite);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
    }
    
    setSelectedRoute(route);
  };

  return (
    <Routes>
      <Route path="/" element={<MapPage selectedRoute={selectedRoute} />} />
      
      {/* 사용자 유형 선택 페이지 */}
      <Route path="/user-type-selection" element={<UserTypeSelectionPage />} />
      
      {/* 각 사용자 유형별 경로검색 페이지 */}
      <Route 
        path="/route-search/wheelchair" 
        element={<WheelchairRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      <Route 
        path="/route-search/infant" 
        element={<InfantRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      <Route 
        path="/route-search/elderly" 
        element={<ElderlyRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      <Route 
        path="/route-search/pregnant" 
        element={<PregnantRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      <Route 
        path="/route-search/low-vision" 
        element={<LowVisionRouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      
      {/* 기존 경로검색 페이지 (하위 호환성) */}
      <Route 
        path="/route-search" 
        element={<RouteSearchPage onRouteSelect={handleRouteSelect} addToFavorites={location.search.includes('addToFavorites=true')} />} 
      />
      
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">지도 로딩에 실패했습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <HighContrastProvider>
      <VoiceGuideProvider>
        <Router>
          <AppContent />
        </Router>
      </VoiceGuideProvider>
    </HighContrastProvider>
  );
}
