'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, remove } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';
import { deleteUser, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ratings');
  const [userRatings, setUserRatings] = useState([]);
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [allMovies, setAllMovies] = useState({});
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load all movies
    const moviesRef = ref(db, 'movies');
    onValue(moviesRef, (snapshot) => {
      setAllMovies(snapshot.val() || {});
    });

    // Load user ratings
    const ratingsRef = ref(db, `userRatings/${user.uid}`);
    onValue(ratingsRef, (snapshot) => {
      const ratingsData = snapshot.val();
      const ratings = ratingsData ? Object.keys(ratingsData).map(movieId => ({
        movieId,
        ...ratingsData[movieId]
      })) : [];
      setUserRatings(ratings);
    });

    // Load user watchlist
    const watchlistRef = ref(db, `userWatchlist/${user.uid}`);
    onValue(watchlistRef, (snapshot) => {
      const watchlistData = snapshot.val();
      const watchlist = watchlistData ? Object.keys(watchlistData).map(movieId => ({
        movieId,
        ...watchlistData[movieId]
      })) : [];
      setUserWatchlist(watchlist);
    });
  }, [user]);

  // Generate recommendations based on user's ratings and preferences
  useEffect(() => {
    if (Object.keys(allMovies).length === 0 || userRatings.length === 0) return;

    // Get user's highly rated movies (4+ stars)
    const highlyRatedMovies = userRatings
      .filter(rating => rating.rating >= 4)
      .map(rating => allMovies[rating.movieId])
      .filter(Boolean);

    // Get genres from highly rated movies
    const preferredGenres = new Set();
    highlyRatedMovies.forEach(movie => {
      if (movie.genres) {
        let genres = [];
        if (Array.isArray(movie.genres)) {
          genres = movie.genres;
        } else if (typeof movie.genres === "string") {
          if (movie.genres.startsWith("[")) {
            try {
              genres = JSON.parse(movie.genres.replace(/'/g, '"'));
            } catch {
              genres = movie.genres.split(/\s+|,/);
            }
          } else if (movie.genres.includes(",")) {
            genres = movie.genres.split(",");
          } else {
            genres = movie.genres.split(" ");
          }
        }
        genres.forEach(genre => preferredGenres.add(genre.trim()));
      }
    });

    // Get movies user hasn't rated or added to watchlist
    const ratedMovieIds = new Set(userRatings.map(r => r.movieId));
    const watchlistMovieIds = new Set(userWatchlist.map(w => w.movieId));
    
    const candidateMovies = Object.entries(allMovies)
      .filter(([movieId]) => !ratedMovieIds.has(movieId) && !watchlistMovieIds.has(movieId))
      .map(([movieId, movie]) => ({ ...movie, id: movieId }));

    // Score movies based on genre match and metascore
    const scoredMovies = candidateMovies.map(movie => {
      let score = 0;
      
      // Genre matching
      if (movie.genres && preferredGenres.size > 0) {
        let movieGenres = [];
        if (Array.isArray(movie.genres)) {
          movieGenres = movie.genres;
        } else if (typeof movie.genres === "string") {
          if (movie.genres.startsWith("[")) {
            try {
              movieGenres = JSON.parse(movie.genres.replace(/'/g, '"'));
            } catch {
              movieGenres = movie.genres.split(/\s+|,/);
            }
          } else if (movie.genres.includes(",")) {
            movieGenres = movie.genres.split(",");
          } else {
            movieGenres = movie.genres.split(" ");
          }
        }
        
        const genreMatches = movieGenres.filter(genre => 
          preferredGenres.has(genre.trim())
        ).length;
        score += genreMatches * 10;
      }
      
      // Metascore bonus
      if (movie.metascore && !isNaN(movie.metascore)) {
        score += parseInt(movie.metascore) / 10;
      }
      
      return { ...movie, score };
    });

    // Sort by score and take top 12
    const recommendations = scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    setRecommendedMovies(recommendations);
  }, [allMovies, userRatings, userWatchlist]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const deleteAccount = async () => {
    try {
      // Delete user data
      const updates = {};
      updates[`userRatings/${user.uid}`] = null;
      updates[`userWatchlist/${user.uid}`] = null;
      
      await Promise.all([
        // Delete from Realtime Database
        ...Object.entries(updates).map(([path, value]) => 
          value === null ? remove(ref(db, path)) : null
        ),
        // Delete user account
        deleteUser(user)
      ]);

      await signOut(auth);
      alert('Account deleted successfully.');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account: ' + error.message);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Please login to view your profile.</p>
        <Link href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => window.history.back()} style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          ← Back to Movies
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 auto 15px'
          }}>
            {user.email[0].toUpperCase()}
          </div>
          <p style={{ fontSize: '18px', color: '#333' }}>{user.email}</p>
        </div>
        
        <div></div> {/* Spacer */}
      </div>

      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('ratings')}
          style={{
            padding: '15px 30px',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'ratings' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'ratings' ? '#007bff' : '#666',
            fontWeight: activeTab === 'ratings' ? 'bold' : 'normal'
          }}
        >
          My Ratings
        </button>
        <button
          onClick={() => setActiveTab('watchlist')}
          style={{
            padding: '15px 30px',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'watchlist' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'watchlist' ? '#007bff' : '#666',
            fontWeight: activeTab === 'watchlist' ? 'bold' : 'normal'
          }}
        >
          My Watchlist
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          style={{
            padding: '15px 30px',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'recommended' ? '3px solid #007bff' : '3px solid transparent',
            color: activeTab === 'recommended' ? '#007bff' : '#666',
            fontWeight: activeTab === 'recommended' ? 'bold' : 'normal'
          }}
        >
          Recommended
        </button>
      </div>

      {activeTab === 'ratings' && (
        <div className="movie-grid">
          {userRatings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1/-1' }}>
              You haven't rated any movies yet.
            </div>
          ) : (
            userRatings.sort((a, b) => b.timestamp - a.timestamp).map(rating => {
              const movie = allMovies[rating.movieId];
              if (!movie) return null;
              
              return (
                <div key={rating.movieId} className="movie-card" onClick={() => window.location.href = `/movie/${rating.movieId}`}>
                  <img
                    src={movie.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={movie.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                  <h3>{movie.title}</h3>
                  <div style={{ color: '#ffc107', fontSize: '16px', margin: '5px 0' }}>
                    {formatStars(rating.rating)}
                  </div>
                  <p><strong>Your rating:</strong> {rating.rating}/5</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    Rated on: {formatTimestamp(rating.timestamp)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'watchlist' && (
        <div className="movie-grid">
          {userWatchlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1/-1' }}>
              Your watchlist is empty.
            </div>
          ) : (
            userWatchlist.sort((a, b) => b.addedAt - a.addedAt).map(item => {
              const movie = allMovies[item.movieId];
              if (!movie) return null;
              
              return (
                <div key={item.movieId} className="movie-card" onClick={() => window.location.href = `/movie/${item.movieId}`}>
                  <img
                    src={movie.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={movie.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                  <h3>{movie.title}</h3>
                  <p><strong>Director:</strong> {movie.director || 'Unknown'}</p>
                  <p><strong>Year:</strong> {movie.year || 'Unknown'}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    Added on: {formatTimestamp(item.addedAt)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'recommended' && (
        <div className="movie-grid">
          {recommendedMovies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', gridColumn: '1/-1' }}>
              {userRatings.length === 0 
                ? 'Rate some movies to get personalized recommendations!'
                : 'No recommendations available at the moment.'
              }
            </div>
          ) : (
            <>
              <div style={{ gridColumn: '1/-1', marginBottom: '20px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '10px' }}>🎯 Recommended for You</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Based on your highly rated movies and preferred genres
                </p>
              </div>
              {recommendedMovies.map(movie => (
                <div key={movie.id} className="movie-card" onClick={() => window.location.href = `/movie/${movie.id}`}>
                  <img
                    src={movie.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={movie.title}
                    className="movie-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                    }}
                  />
                  <h3>{movie.title}</h3>
                  <p><strong>Director:</strong> {movie.director || 'Unknown'}</p>
                  <p><strong>Year:</strong> {movie.year || 'Unknown'}</p>
                  <p><strong>Genres:</strong> {movie.genres || 'N/A'}</p>
                  {movie.metascore && (
                    <p><strong>Metascore:</strong> {movie.metascore}/100</p>
                  )}
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '5px 10px', 
                    background: '#e3f2fd', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    color: '#1976d2',
                    textAlign: 'center'
                  }}>
                    Recommended
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fff3f3',
        border: '1px solid #ffcccc',
        borderRadius: '8px'
      }}>
        <h3>⚠️ Danger Zone</h3>
        <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Delete My Account
        </button>
      </div>

      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            textAlign: 'center'
          }}>
            <h2>Confirm Account Deletion</h2>
            <p>Are you sure you want to delete your account? This will permanently remove:</p>
            <ul style={{ textAlign: 'left', margin: '15px 0' }}>
              <li>All your movie ratings</li>
              <li>Your watchlist</li>
              <li>Your account information</li>
            </ul>
            <p><strong>This action cannot be undone.</strong></p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button
                onClick={deleteAccount}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}