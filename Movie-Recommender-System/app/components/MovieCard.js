'use client';
import Link from 'next/link';

export default function MovieCard({ movie, searchTerm = '', selectedGenre = '' }) {
  const formatList = (data) => {
    if (Array.isArray(data)) {
      return data.join(', ');
    } else if (typeof data === 'string') {
      return data;
    } else {
      return 'N/A';
    }
  };

  const highlightText = (text, search) => {
    if (!search || !text) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.toString().replace(regex, '<mark>$1</mark>');
  };

  return (
    <Link href={`/movie/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="movie-card">
        <img
          src={movie.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={movie.title}
          className="movie-poster"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
        
        <h3 dangerouslySetInnerHTML={{ __html: highlightText(movie.title, searchTerm) }} />
        
        <p className="movie-year">
          {movie.year || 'Year unknown'}
        </p>
        
        <p className="movie-info">
          <strong>Director:</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: highlightText(movie.director || 'Unknown', searchTerm) }} />
        </p>
        
        <p className="movie-info">
          <strong>Genres:</strong> {formatList(movie.genres)}
          {selectedGenre && movie.genres?.toLowerCase().includes(selectedGenre.toLowerCase()) && (
            <span style={{ 
              background: 'var(--accent-secondary)', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '10px', 
              fontSize: '12px', 
              marginLeft: '8px',
              fontWeight: 'bold'
            }}>
              ✓
            </span>
          )}
        </p>
        
        <p className="movie-info">
          <strong>Rating:</strong> {movie.metascore ? `${movie.metascore}/100` : 'N/A'}
        </p>
      </div>
    </Link>
  );
}