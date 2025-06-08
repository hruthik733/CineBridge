class MovieChatbot {
    constructor() {
        this.toggleBtn = document.getElementById('chatToggle');
        this.chatContainer = document.querySelector('.chat-container');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.chatIcon = document.querySelector('.chat-icon');
        this.closeIcon = document.querySelector('.close-icon');
        this.OMDB_API_KEY = 'c66312c0'; // Your OMDB API key
        
        this.setupEventListeners();
        this.sendWelcomeMessage();
    }

    setupEventListeners() {
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.sendBtn.addEventListener('click', () => this.handleUserInput());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
    }

    toggleChat() {
        const isVisible = this.chatContainer.style.display !== 'none';
        this.chatContainer.style.display = isVisible ? 'none' : 'flex';
        this.chatIcon.style.display = isVisible ? 'block' : 'none';
        this.closeIcon.style.display = isVisible ? 'none' : 'block';
    }

    async handleUserInput() {
        const userInput = this.chatInput.value.trim();
        if (!userInput) return;

        // Add user message
        this.addMessage(userInput, 'user');
        this.chatInput.value = '';

        // Get bot response
        const response = await this.getBotResponse(userInput);
        this.addMessage(response, 'bot');
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    sendWelcomeMessage() {
        setTimeout(() => {
            this.addMessage("👋 Hi! I'm your movie assistant. Ask me about movie recommendations or any movie-related questions!", 'bot');
        }, 500);
    }

    async getBotResponse(userInput) {
        const input = userInput.toLowerCase();
        
        try {
            // Movie recommendation logic
            if (input.includes('recommend') || input.includes('suggestion')) {
                if (input.includes('action')) {
                    const movies = await this.searchMoviesByGenre('Action');
                    return this.formatMovieRecommendations(movies);
                } else if (input.includes('comedy')) {
                    const movies = await this.searchMoviesByGenre('Comedy');
                    return this.formatMovieRecommendations(movies);
                } else if (input.includes('drama')) {
                    const movies = await this.searchMoviesByGenre('Drama');
                    return this.formatMovieRecommendations(movies);
                }
                return "What genre are you interested in? I can recommend Action, Comedy, or Drama movies!";
            }

            // Search for specific movie
            if (input.includes('tell me about') || input.includes('search for')) {
                const movieTitle = input.replace('tell me about', '').replace('search for', '').trim();
                const movieInfo = await this.searchMovie(movieTitle);
                return this.formatMovieInfo(movieInfo);
            }
            
            // Basic responses remain the same
            if (input.includes('hello') || input.includes('hi')) {
                return "Hello! How can I help you with movies today?";
            }
            
            if (input.includes('genre')) {
                return "We have various genres including Action, Comedy, Drama, Sci-Fi, and more. Which genre interests you?";
            }
            
            if (input.includes('thank')) {
                return "You're welcome! Feel free to ask if you need more help!";
            }

            return "I'm here to help! You can:\n1. Ask for movie recommendations\n2. Search for specific movies\n3. Ask about different genres";
        } catch (error) {
            console.error('Error in bot response:', error);
            return "I'm having trouble getting that information right now. Please try again later.";
        }
    }

    async searchMovie(title) {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${this.OMDB_API_KEY}`);
        const data = await response.json();
        return data;
    }

    async searchMoviesByGenre(genre) {
        // Since OMDB doesn't have a direct genre search, we'll use some popular movies from each genre
        const genreMovies = {
            'Action': ['Die Hard', 'The Dark Knight', 'Mad Max: Fury Road'],
            'Comedy': ['The Hangover', 'Superbad', 'Bridesmaids'],
            'Drama': ['The Shawshank Redemption', 'The Godfather', 'Forrest Gump']
        };

        const movies = await Promise.all(
            genreMovies[genre].map(movie => this.searchMovie(movie))
        );
        return movies.filter(movie => movie.Response === "True");
    }

    formatMovieInfo(movie) {
        if (movie.Response === "False") {
            return "I couldn't find that movie. Try another one!";
        }
        return `🎬 ${movie.Title} (${movie.Year})\n⭐ Rating: ${movie.imdbRating}/10\n🎭 Genre: ${movie.Genre}\n📝 Plot: ${movie.Plot}`;
    }

    formatMovieRecommendations(movies) {
        if (!movies.length) {
            return "I couldn't find any recommendations at the moment.";
        }
        
        let response = "Here are some recommendations:\n\n";
        movies.forEach(movie => {
            response += `🎬 ${movie.Title} (${movie.Year}) - ⭐ ${movie.imdbRating}/10\n`;
        });
        response += "\nWould you like to know more about any of these movies?";
        return response;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovieChatbot();
}); 