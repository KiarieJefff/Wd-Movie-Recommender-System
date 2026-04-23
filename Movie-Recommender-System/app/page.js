'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const moviesPerPage = 9;

 useEffect(() => {
    console.log('Connecting to Firebase...');
    const moviesRef = ref(db, 'movies');
    
    const unsubscribe = onValue(moviesRef, (snapshot) => {
      console.log('Firebase data received:', snapshot.exists());
      const moviesData = snapshot.val();
      
      if (moviesData) {
        const moviesArray = Object.keys(moviesData).map(key => ({
          ...moviesData[key],
          id: key
        }));
        
        setMovies(moviesArray);
        setFilteredMovies(moviesArray);
        
        // Extract unique genres from all movies
        const allGenres = moviesArray.reduce((acc, movie) => {
          if (movie.genres) {
            let genres = [];

            if (Array.isArray(movie.genres)) {
              // already an array
              genres = movie.genres;
            } else if (typeof movie.genres === "string") {
              if (movie.genres.startsWith("[")) {
                // stringified list → convert to array
                try {
                  genres = JSON.parse(movie.genres.replace(/'/g, '"'));
                } catch {
                  genres = movie.genres.split(/\s+|,/); // fallback
                }
              } else if (movie.genres.includes(",")) {
                // comma separated
                genres = movie.genres.split(",");
              } else {
                // space separated
                genres = movie.genres.split(" ");
              }
            }

            genres.map(g => g.trim()).forEach(genre => {
              if (genre && !acc.includes(genre)) {
                acc.push(genre);
              }
            });
          }
          return acc;
        }, []);

        
        setGenres(allGenres.sort());
      } else {
        setError('No movies found in the database. Please import your CSV data.');
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setError('Error loading movies: ' + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = movies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.cast && typeof movie.cast === 'string' && movie.cast.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (movie.description && movie.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply genre filter
    if (selectedGenre !== "all") {
  filtered = filtered.filter(movie => {
    if (!movie.genres) return false;

    let genresStr = "";

    if (Array.isArray(movie.genres)) {
      genresStr = movie.genres.join(", ");
    } else if (typeof movie.genres === "string") {
      if (movie.genres.startsWith("[")) {
        // stringified list
        try {
          const parsed = JSON.parse(movie.genres.replace(/'/g, '"'));
          genresStr = parsed.join(", ");
        } catch {
          genresStr = movie.genres; // fallback
        }
      } else {
        genresStr = movie.genres;
      }
    }

    return genresStr.toLowerCase().includes(selectedGenre.toLowerCase());
  });
}

    setFilteredMovies(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, movies]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
  };

  if (loading) return <div className="loading">Loading movies...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Search and Filter Section */}
      <div style={{ 
        background: '#1e293b', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        border: '1px solid #334155'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto', 
          gap: '1rem', 
          alignItems: 'end',
          marginBottom: '1rem'
        }}>
          {/* Search Input */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              Search Movies
            </label>
            <input
              type="text"
              placeholder="🔍 Search by title, director, cast, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #334155',
                borderRadius: '8px',
                width: '100%',
                fontSize: '16px',
                background: '#0f172a',
                color: '#f8fafc'
              }}
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            disabled={searchTerm === '' && selectedGenre === 'all'}
            style={{
              padding: '12px 20px',
              border: '1px solid #334155',
              background: '#374151',
              color: '#f8fafc',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: (searchTerm === '' && selectedGenre === 'all') ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Genre Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#94a3b8',
            fontWeight: '500'
          }}>
            Filter by Genre
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {/* All Genres Option */}
            <button
              onClick={() => setSelectedGenre('all')}
              className={`genre-btn ${selectedGenre === 'all' ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                border: '1px solid #334155',
                background: selectedGenre === 'all' ? '#3b82f6' : '#1e293b',
                color: selectedGenre === 'all' ? 'white' : '#cbd5e1',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              All Genres
            </button>

            {/* Individual Genre Options */}
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #334155',
                  background: selectedGenre === genre ? '#3b82f6' : '#1e293b',
                  color: selectedGenre === genre ? 'white' : '#cbd5e1',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        padding: '0.5rem 0'
      }}>
        <span style={{ color: '#94a3b8' }}>
          {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
          {selectedGenre !== 'all' && ` in ${selectedGenre}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        
        {(searchTerm || selectedGenre !== 'all') && (
          <button
            onClick={clearFilters}
            style={{
              padding: '6px 12px',
              border: '1px solid #334155',
              background: 'transparent',
              color: '#93c5fd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Movies Grid */}
      <div className="movie-grid">
        {filteredMovies
          .slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage)
          .map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        }
      </div>

      {/* Empty State */}
      {filteredMovies.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#94a3b8',
          background: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
          <h3 style={{ marginBottom: '0.5rem', color: '#e2e8f0' }}>No movies found</h3>
          <p>
            {searchTerm || selectedGenre !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No movies available in the database.'
            }
          </p>
          {(searchTerm || selectedGenre !== 'all') && (
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                border: '1px solid #3b82f6',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredMovies.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredMovies.length / moviesPerPage)}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}