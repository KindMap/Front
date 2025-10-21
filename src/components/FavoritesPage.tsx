import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useNavigate } from 'react-router-dom';
import { Favorite } from '../types';
import { useVoiceGuide } from '../contexts/VoiceGuideContext';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { speak } = useVoiceGuide();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleSelectFavorite = (favorite: Favorite) => {
    navigate('/', { state: { selectedRoute: favorite } });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              onMouseEnter={() => speak('뒤로가기')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1>즐겨찾기</h1>
          </div>
          <Button
            size="icon"
            onClick={() => navigate('/route-search?addToFavorites=true')}
            onMouseEnter={() => speak('경로 추가하기')}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              저장된 즐겨찾기가 없습니다.
            </p>
            <Button 
              onClick={() => navigate('/route-search?addToFavorites=true')}
              onMouseEnter={() => speak('경로 추가하기')}
            >
              <Plus className="w-4 h-4 mr-2" />
              경로 추가하기
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>출발지</TableHead>
                    <TableHead>도착지</TableHead>
                    <TableHead className="hidden md:table-cell">소요시간</TableHead>
                    <TableHead className="hidden md:table-cell">거리</TableHead>
                    <TableHead className="hidden sm:table-cell">설명</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favorites.map((favorite) => (
                    <TableRow 
                      key={favorite.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelectFavorite(favorite)}
                      onMouseEnter={() => speak(`${favorite.departure}에서 ${favorite.destination}까지`)}
                    >
                      <TableCell>{favorite.departure}</TableCell>
                      <TableCell>{favorite.destination}</TableCell>
                      <TableCell className="hidden md:table-cell">{favorite.duration}</TableCell>
                      <TableCell className="hidden md:table-cell">{favorite.distance}</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-xs truncate">
                        {favorite.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(favorite.id);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            speak('삭제');
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
