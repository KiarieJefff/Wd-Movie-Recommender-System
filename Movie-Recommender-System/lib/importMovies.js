import { db } from './firebase';
import { ref, set } from 'firebase/database';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

export async function importMovies(csvFilePath) {
  try {
    console.log('Reading CSV file:', csvFilePath);
    
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`Found ${records.length} movies in CSV`);

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        const movieId = record.ImdbId || record.imdbId || Math.random().toString(36).substr(2, 9);
        const movieRef = ref(db, `movies/${movieId}`);
        
        const movieData = {
          imdbId: record.ImdbId || record.imdbId,
          title: record.title,
          year: parseInt(record.year) || record.year,
          director: record.director,
          genres: record.genres ? record.genres.split(',').map(g => g.trim()).join(', ') : '',
          metascore: record.metascore ? parseInt(record.metascore) : null,
          description: record.description,
          image_url: record.image_url,
          cast: record.cast ? record.cast.split(',').map(c => c.trim()).join(', ') : '',
          createdAt: Date.now()
        };

        await set(movieRef, movieData);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`Uploaded ${successCount} movies...`);
        }
      } catch (error) {
        console.error('Error uploading movie:', error);
        errorCount++;
      }
    }

    console.log(`Import completed! Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const csvFilePath = process.argv[2] || 'movies.csv';
  importMovies(csvFilePath)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}