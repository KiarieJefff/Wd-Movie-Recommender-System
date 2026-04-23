export default function Footer() {
  return (
    <footer style={{
      background: '#2a3a4bff',
      color: 'white',
      textAlign: 'center',
      padding: '2rem 1rem',
      marginTop: '3rem'
    }}>
      <div style={{ margin: '1rem 0' }}>
        <a href="/" style={{ color: '#3498db', textDecoration: 'none', margin: '0 1rem' }}>Home</a>
        <a href="/profile" style={{ color: '#3498db', textDecoration: 'none', margin: '0 1rem' }}>Profile</a>
        <a href="#" style={{ color: '#3498db', textDecoration: 'none', margin: '0 1rem' }}>Privacy</a>
        <a href="#" style={{ color: '#3498db', textDecoration: 'none', margin: '0 1rem' }}>Terms</a>
      </div>
      
      <div style={{ margin: '1rem 0' }}>
        <a href="#" style={{ color: '#bdc3c7', margin: '0 0.5rem', fontSize: '1.2rem' }}>📘</a>
        <a href="#" style={{ color: '#bdc3c7', margin: '0 0.5rem', fontSize: '1.2rem' }}>🐦</a>
        <a href="#" style={{ color: '#bdc3c7', margin: '0 0.5rem', fontSize: '1.2rem' }}>📷</a>
      </div>
      
      <p style={{ color: '#bdc3c7', margin: '0.5rem 0' }}>&copy; 2025 Movie Database. All rights reserved.</p>
      <p style={{ color: '#bdc3c7', margin: '0.5rem 0' }}>Made with ❤️ for movie lovers</p>
    </footer>
  );
}