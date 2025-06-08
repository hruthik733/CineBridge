const WATCHMODE_API_KEY = 'Wohwag9SlpUeavUw02BFKjPisEnjUOPF8axb9VTG';

async function searchMovie(title, year) {
    try {
        // First try with both title and year
        const response = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`);
        const data = await response.json();
        
        if (data.title_results && data.title_results.length > 0) {
            // If year is provided, try to find an exact match
            if (year) {
                const exactMatch = data.title_results.find(movie => 
                    movie.name.toLowerCase() === title.toLowerCase() && 
                    movie.year === parseInt(year)
                );
                if (exactMatch) {
                    return exactMatch.id;
                }
            }
            
            // If no exact match or no year provided, return the first result
            return data.title_results[0].id;
        }
        return null;
    } catch (error) {
        console.error('Error searching for movie:', error);
        return null;
    }
}

async function getStreamingSources(movieId) {
    try {
        const response = await fetch(`https://api.watchmode.com/v1/title/${movieId}/sources/?apiKey=${WATCHMODE_API_KEY}`);
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            // Find the first available streaming source
            const streamingSource = data.find(source => source.type === 'sub' || source.type === 'rent' || source.type === 'buy');
            return streamingSource ? streamingSource.web_url : null;
        }
        return null;
    } catch (error) {
        console.error('Error getting streaming sources:', error);
        return null;
    }
}

export async function updateWatchNowButton(movieTitle, movieYear) {
    const watchNowBtn = document.getElementById('watchNowBtn');
    
    // Disable button and show loading state
    watchNowBtn.href = '#';
    watchNowBtn.textContent = 'Loading...';
    watchNowBtn.classList.add('disabled');
    
    try {
        // Search for the movie with year
        const movieId = await searchMovie(movieTitle, movieYear);
        
        if (movieId) {
            // Get streaming sources
            const streamingUrl = await getStreamingSources(movieId);
            
            if (streamingUrl) {
                // Update button with streaming URL
                watchNowBtn.href = streamingUrl;
                watchNowBtn.textContent = 'Watch Now';
                watchNowBtn.classList.remove('disabled');
            } else {
                // No streaming sources found
                watchNowBtn.textContent = 'Not Available';
                watchNowBtn.classList.add('disabled');
            }
        } else {
            // Movie not found
            watchNowBtn.textContent = 'Not Found';
            watchNowBtn.classList.add('disabled');
        }
    } catch (error) {
        console.error('Error updating watch now button:', error);
        watchNowBtn.textContent = 'Error';
        watchNowBtn.classList.add('disabled');
    }
} 