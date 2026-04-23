'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import RatingStars from '@/components/RatingStars';

export default function MovieDetails() {
  const params = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState([]);

  useEffect(() => {
    const movieRef = ref(db, `movies/${params.id}`);
    
    const unsubscribe = onValue(movieRef, (snapshot) => {
      setMovie({ ...snapshot.val(), id: params.id });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  useEffect(() => {
    if (user && movie) {
      // Load user rating
      const ratingRef = ref(db, `userRatings/${user.uid}/${movie.id}`);
      onValue(ratingRef, (snapshot) => {
        setUserRating(snapshot.val()?.rating || 0);
      });

      // Load watchlist status
      const watchlistRef = ref(db, `userWatchlist/${user.uid}/${movie.id}`);
      onValue(watchlistRef, (snapshot) => {
        setIsInWatchlist(snapshot.exists());
      });
    }
  }, [user, movie]);

  // Load similar movies based on genre
  useEffect(() => {
    if (!movie) return;

    const moviesRef = ref(db, 'movies');
    onValue(moviesRef, (snapshot) => {
      const allMovies = snapshot.val();
      if (!allMovies) return;

      // Parse current movie's genres
      let currentGenres = [];
      if (movie.genres) {
        if (Array.isArray(movie.genres)) {
          currentGenres = movie.genres;
        } else if (typeof movie.genres === "string") {
          if (movie.genres.startsWith("[")) {
            try {
              currentGenres = JSON.parse(movie.genres.replace(/'/g, '"'));
            } catch {
              currentGenres = movie.genres.split(/\s+|,/);
            }
          } else if (movie.genres.includes(",")) {
            currentGenres = movie.genres.split(",");
          } else {
            currentGenres = movie.genres.split(" ");
          }
        }
        currentGenres = currentGenres.map(g => g.trim()).filter(Boolean);
      }

      if (currentGenres.length === 0) {
        setSimilarMovies([]);
        return;
      }

      // Find movies with matching genres
      const candidateMovies = Object.entries(allMovies)
        .filter(([movieId]) => movieId !== movie.id)
        .map(([movieId, movieData]) => ({ ...movieData, id: movieId }))
        .filter(candidateMovie => {
          if (!candidateMovie.genres) return false;

          let candidateGenres = [];
          if (Array.isArray(candidateMovie.genres)) {
            candidateGenres = candidateMovie.genres;
          } else if (typeof candidateMovie.genres === "string") {
            if (candidateMovie.genres.startsWith("[")) {
              try {
                candidateGenres = JSON.parse(candidateMovie.genres.replace(/'/g, '"'));
              } catch {
                candidateGenres = candidateMovie.genres.split(/\s+|,/);
              }
            } else if (candidateMovie.genres.includes(",")) {
              candidateGenres = candidateMovie.genres.split(",");
            } else {
              candidateGenres = candidateMovie.genres.split(" ");
            }
          }
          candidateGenres = candidateGenres.map(g => g.trim()).filter(Boolean);

          // Check if there's at least one genre match
          return candidateGenres.some(genre => 
            currentGenres.some(currentGenre => 
              currentGenre.toLowerCase() === genre.toLowerCase()
            )
          );
        });

      // Sort by metascore (rating) in descending order and take top 5
      const sortedMovies = candidateMovies
        .sort((a, b) => {
          const scoreA = a.metascore ? parseInt(a.metascore) : 0;
          const scoreB = b.metascore ? parseInt(b.metascore) : 0;
          return scoreB - scoreA;
        })
        .slice(0, 5);

      setSimilarMovies(sortedMovies);
    });
  }, [movie]);

  const handleRating = async (rating) => {
    if (!user) {
      alert('Please login to rate movies');
      return;
    }
    
    const ratingRef = ref(db, `userRatings/${user.uid}/${movie.id}`);
    await set(ratingRef, {
      rating: rating,
      timestamp: Date.now()
    });
  };

  const toggleWatchlist = async () => {
    if (!user) {
      alert('Please login to manage your watchlist');
      return;
    }

    const watchlistRef = ref(db, `userWatchlist/${user.uid}/${movie.id}`);
    
    if (isInWatchlist) {
      await remove(watchlistRef);
    } else {
      await set(watchlistRef, {
        addedAt: Date.now(),
        movieId: movie.id,
        title: movie.title
      });
    }
  };

  if (loading) return <div className="loading">Loading movie details...</div>;
  if (!movie) return <div className="error">Movie not found</div>;

  return (
    <div>
      <button onClick={() => window.history.back()} style={{
        padding: '10px 20px',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '10px'
      }}>
        ← Back to Movies
      </button>

      <div style={{
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <img
            src={movie.image_url || 'https://via.placeholder.com/300x450?text=No+Image'}
            alt={movie.title}
            style={{
              width: '300px',
              height: '450px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found';
            }}
          />
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{movie.title}</h1>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
              {movie.year || 'Year unknown'}
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Director:</strong> {movie.director || 'Unknown'}</p>
              <p><strong>Genres:</strong> {movie.genres || 'N/A'}</p>
              <p><strong>Cast:</strong> {movie.cast || 'N/A'}</p>
              <p><strong>Metascore:</strong> {movie.metascore ? `${movie.metascore}/100` : 'N/A'}</p>
            </div>
            
            <p style={{ lineHeight: '1.6' }}>{movie.description || 'No description available.'}</p>
          </div>
        

        <div style={{
          margin: '30px 0',
          padding: '20px',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Rate this movie</h3>
            <RatingStars
              rating={userRating}
              onRate={handleRating}
              disabled={!user}
            />
            {!user && (
              <p style={{ color: '#dc3545', marginTop: '10px' }}>Please login to rate this movie.</p>
            )}
          </div>
          
          <div>
            <h3>Watchlist</h3>
            <button
              onClick={toggleWatchlist}
              style={{
                padding: '10px 20px',
                background: isInWatchlist ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              disabled={!user}
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watch Later'}
            </button>
            {!user && (
              <p style={{ color: '#dc3545', marginTop: '10px' }}>Please login to manage your watchlist.</p>
            )}
          </div>
        </div>

        {/* Viewers Also Liked Section */}
        {similarMovies.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e0e0e0' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>
              🎬 Viewers Also Liked
            </h3>
            <div style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              paddingBottom: '10px',
              scrollbarWidth: 'thin'
            }}>
              {similarMovies.map(similarMovie => (
                <div
                  key={similarMovie.id}
                  onClick={() => window.location.href = `/movie/${similarMovie.id}`}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <img
                    src={similarMovie.image_url || 'https://via.placeholder.com/200x300?text=No+Image'}
                    alt={similarMovie.title}
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x300?text=Image+Not+Found';
                    }}
                  />
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                    lineHeight: '1.3',
                    minHeight: '40px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {similarMovie.title}
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px'
                  }}>
                    <strong>Year:</strong> {similarMovie.year || 'Unknown'}
                  </p>
                  {similarMovie.metascore && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        Metascore:
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: parseInt(similarMovie.metascore) >= 70 ? '#10b981' : 
                               parseInt(similarMovie.metascore) >= 50 ? '#f59e0b' : '#ef4444'
                      }}>
                        {similarMovie.metascore}
                      </span>
                    </div>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--accent-primary)',
                    fontWeight: '500',
                    textAlign: 'center',
                    marginTop: '10px',
                    padding: '4px 8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px'
                  }}>
                    Similar Genre
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}