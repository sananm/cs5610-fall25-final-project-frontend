import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Badge, Pagination } from 'react-bootstrap';
import { FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { movieAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OnboardingModal({ show, onComplete }) {
  const { updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Preferences, Step 2: Movie Selection
  const [selectedLanguages, setSelectedLanguages] = useState(['en']);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const moviesPerPage = 24;

  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    // Don't fetch if we're in the process of completing onboarding
    if (isCompleting) return;

    if (show && currentStep === 1) {
      setLoading(false);
    }
    if (show && currentStep === 2 && allMovies.length === 0) {
      fetchDiverseMovies();
    }
  }, [show, currentStep, isCompleting]);

  const fetchDiverseMovies = async () => {
    try {
      setLoading(true);

      // Fetch multiple pages for each language using discover endpoint
      const requests = [];

      // General popular/trending
      for (let page = 1; page <= 5; page++) {
        requests.push(movieAPI.getPopularMovies(page));
      }
      requests.push(movieAPI.getTrendingMovies());

      // Genre IDs for targeted fetching
      const genreIds = {
        action: 28,
        adventure: 12,
        animation: 16,
        comedy: 35,
        crime: 80,
        documentary: 99,
        drama: 18,
        family: 10751,
        fantasy: 14,
        horror: 27,
        romance: 10749,
        sciFi: 878,
        thriller: 53
      };

      // Use discover endpoint to get movies by actual language code
      // Fetch MORE pages for languages, especially Hindi
      const languages = [
        { code: 'hi', pages: 20 },  // Hindi - 20 pages = 400 movies
        { code: 'en', pages: 10 },  // English - 200 movies
        { code: 'es', pages: 8 },   // Spanish
        { code: 'fr', pages: 8 },   // French
        { code: 'de', pages: 5 },   // German
        { code: 'it', pages: 5 },   // Italian
        { code: 'ja', pages: 8 },   // Japanese
        { code: 'ko', pages: 8 },   // Korean
        { code: 'zh', pages: 8 },   // Chinese
        { code: 'pt', pages: 5 }    // Portuguese
      ];

      // Fetch movies for each language (without genre filter)
      for (const lang of languages) {
        for (let page = 1; page <= lang.pages; page++) {
          requests.push(movieAPI.discoverMovies(lang.code, '', page));
        }
      }

      // ALSO fetch movies for EACH language+genre combination for popular languages
      // This ensures we have enough movies for any genre selection
      const popularLanguages = ['hi', 'en', 'es', 'ko', 'ja'];  // Hindi, English, Spanish, Korean, Japanese
      const popularGenres = ['comedy', 'action', 'drama', 'romance', 'thriller', 'adventure'];

      for (const langCode of popularLanguages) {
        for (const genreName of popularGenres) {
          const genreId = genreIds[genreName];
          if (genreId) {
            // Fetch 5 pages for each language+genre combo
            for (let page = 1; page <= 5; page++) {
              requests.push(movieAPI.discoverMovies(langCode, genreId.toString(), page));
            }
          }
        }
      }

      console.log('Making', requests.length, 'API requests...');
      const responses = await Promise.all(requests);

      // Combine all movies
      const combinedMovies = responses.flatMap(res =>
        (res.data.results || [])
      );

      // Remove duplicates based on ID
      const uniqueMovies = Array.from(
        new Map(combinedMovies.map(movie => [movie.id, movie])).values()
      );

      // Filter out movies without posters
      const moviesWithPosters = uniqueMovies.filter(movie => movie.poster_path);

      console.log('Total unique movies fetched:', moviesWithPosters.length);

      // Log language distribution
      const languageCounts = {};
      moviesWithPosters.forEach(movie => {
        languageCounts[movie.original_language] = (languageCounts[movie.original_language] || 0) + 1;
      });
      console.log('Language distribution:', languageCounts);

      // Log sample Hindi movies to check language codes
      const hindiMovies = moviesWithPosters.filter(m => m.original_language === 'hi');
      console.log('Hindi movies found:', hindiMovies.length);
      console.log('Sample Hindi movies:', hindiMovies.slice(0, 10).map(m => ({ title: m.title, lang: m.original_language, genres: m.genre_ids })));

      setAllMovies(moviesWithPosters); // Store all movies
      filterMoviesByPreferences(moviesWithPosters);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMoviesByPreferences = (movies) => {
    // Create reverse genre map (name to ID)
    const genreNameToId = {
      'Action': 28,
      'Adventure': 12,
      'Animation': 16,
      'Comedy': 35,
      'Crime': 80,
      'Documentary': 99,
      'Drama': 18,
      'Family': 10751,
      'Fantasy': 14,
      'History': 36,
      'Horror': 27,
      'Music': 10402,
      'Mystery': 9648,
      'Romance': 10749,
      'Science Fiction': 878,
      'TV Movie': 10770,
      'Thriller': 53,
      'War': 10752,
      'Western': 37
    };

    const genreIds = selectedGenres.map(genre => genreNameToId[genre]).filter(Boolean);

    // Filter logic:
    // - Language: Must match one of selected languages (strict AND)
    // - Genre: Must match at least one of selected genres (OR within genres)
    // Example: If user selects Hindi + Comedy + Adventure
    //   - Shows: Hindi AND Comedy
    //   - Shows: Hindi AND Adventure
    //   - Shows: Hindi AND (Comedy + Adventure)
    //   - Does NOT show: English Comedy or Hindi Drama

    let filtered = movies;

    console.log('Starting filter with', movies.length, 'movies');
    console.log('Selected languages:', selectedLanguages);
    console.log('Selected genres:', selectedGenres);

    // STEP 1: Filter by language (STRICT - must match one of selected languages)
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(movie =>
        selectedLanguages.includes(movie.original_language)
      );
      console.log('After language filter (strict AND):', filtered.length, 'movies');
      console.log('Sample after language filter:', filtered.slice(0, 5).map(m => ({ title: m.title, lang: m.original_language })));
    }

    // STEP 2: Filter by genre (FLEXIBLE - must match at least one of selected genres)
    if (selectedGenres.length > 0 && genreIds.length > 0) {
      console.log('Filtering by genre IDs (OR condition):', genreIds);
      filtered = filtered.filter(movie =>
        movie.genre_ids?.some(id => genreIds.includes(id))
      );
      console.log('After genre filter (match ANY genre):', filtered.length, 'movies');
    }

    // If multiple languages selected, interleave them for better mix on each page
    let finalMovies;
    if (selectedLanguages.length > 1) {
      // Group movies by language
      const moviesByLang = {};
      selectedLanguages.forEach(lang => {
        moviesByLang[lang] = filtered
          .filter(m => m.original_language === lang)
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      });

      // Interleave movies from different languages
      finalMovies = [];
      let maxLength = Math.max(...Object.values(moviesByLang).map(arr => arr.length));

      for (let i = 0; i < maxLength; i++) {
        // Add one movie from each language in round-robin fashion
        selectedLanguages.forEach(lang => {
          if (moviesByLang[lang][i]) {
            finalMovies.push(moviesByLang[lang][i]);
          }
        });
      }

      console.log('Interleaved movies from', selectedLanguages.length, 'languages');
    } else {
      // Single language or no language filter - just sort by popularity
      finalMovies = filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    console.log('Final filtered movies:', finalMovies.length, 'from', movies.length);
    console.log('Sample filtered movies:', finalMovies.slice(0, 10).map(m => ({
      title: m.title,
      lang: m.original_language,
      genres: m.genre_ids,
      matchingGenres: m.genre_ids?.filter(id => genreIds.includes(id)) || []
    })));

    // If filtering resulted in no movies, show all movies
    if (finalMovies.length === 0) {
      console.log('No movies match filters, showing all movies');
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(finalMovies);
    }
    setCurrentPage(1); // Reset to first page
  };

  const toggleMovie = (movie) => {
    const isSelected = selectedMovies.find(m => m.id === movie.id);

    if (isSelected) {
      setSelectedMovies(selectedMovies.filter(m => m.id !== movie.id));
    } else {
      if (selectedMovies.length < 5) {
        setSelectedMovies([...selectedMovies, movie]);
      }
    }
  };

  const handleComplete = async () => {
    try {
      console.log('Starting onboarding completion...');
      console.log('Selected movies:', selectedMovies.length);
      console.log('Selected languages:', selectedLanguages);
      console.log('Selected genres:', selectedGenres);

      setIsCompleting(true);
      setLoading(true);

      // Extract genres from selected movies
      const allGenres = selectedMovies.flatMap(movie =>
        movie.genre_ids?.map(id => genreMap[id]).filter(Boolean) || []
      );
      const uniqueGenres = [...new Set(allGenres)];

      const favoriteMovies = selectedMovies.map(movie => ({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path
      }));

      const payload = {
        favoriteMovies,
        preferredGenres: selectedGenres.length > 0 ? selectedGenres : uniqueGenres,
        preferredLanguages: selectedLanguages
      };

      console.log('Sending onboarding payload:', payload);

      const response = await authAPI.completeOnboarding(payload);

      console.log('Onboarding response:', response.data);

      if (response.data.user) {
        updateUser(response.data.user);
      }

      setLoading(false);
      onComplete();
    } catch (err) {
      console.error('Error completing onboarding:', err);
      console.error('Error details:', err.response?.data);
      alert(`Failed to complete onboarding: ${err.response?.data?.message || err.message}`);
      setLoading(false);
      setIsCompleting(false);
    }
  };

  const isSelected = (movieId) => selectedMovies.find(m => m.id === movieId);

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleProceedToMovies = () => {
    if (selectedGenres.length === 0) {
      alert('Please select at least one genre');
      return;
    }
    setCurrentStep(2);
  };

  // Pagination logic
  const moviesToDisplay = currentStep === 2 ? filteredMovies : allMovies;
  const totalPages = Math.ceil(moviesToDisplay.length / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const currentMovies = moviesToDisplay.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // TMDB genre ID mapping
  const genreMap = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
  };

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' }
  ];

  // Available genres (text names matching the genreMap)
  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  return (
    <Modal show={show} onHide={() => {}} size="xl" backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>
          {currentStep === 1 ? 'Welcome! Tell us your preferences 🎬' : 'Select your favorite movies 🎬'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {currentStep === 1 ? (
          /* Step 1: Language and Genre Selection */
          <div>
            <div className="mb-4">
              <h5 className="mb-3">Select Your Preferred Languages</h5>
              <p className="text-muted small mb-3">Choose one or more languages for movie recommendations</p>
              <div className="d-flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguages.includes(lang.code) ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => toggleLanguage(lang.code)}
                  >
                    {selectedLanguages.includes(lang.code) && <FaCheck className="me-1" />}
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Select Your Favorite Genres</h5>
              <p className="text-muted small mb-3">Choose at least one genre (you can select multiple)</p>
              <div className="d-flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={() => toggleGenre(genre)}
                  >
                    {selectedGenres.includes(genre) && <FaCheck className="me-1" />}
                    {genre}
                  </Button>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <div className="mt-3">
                  <Badge bg="success">{selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''} selected</Badge>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Movie Selection */
          <>
            <div className="sticky-top pb-3" style={{ zIndex: 10 }}>
              <p className="text-muted mb-2">
                Select 3-5 movies you like. We'll use this to recommend similar content.
              </p>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Badge bg="primary" className="me-2">
                    {selectedMovies.length} / 5 selected
                  </Badge>
                  {selectedMovies.length >= 3 && selectedMovies.length < 5 && (
                    <Badge bg="success">Ready to continue!</Badge>
                  )}
                  {selectedMovies.length === 5 && (
                    <Badge bg="warning" text="dark">Maximum reached</Badge>
                  )}
                </div>
                <Badge bg="secondary">
                  Page {currentPage} of {totalPages}
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading movies based on your preferences...</p>
              </div>
            ) : currentMovies.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No movies found. Try adjusting your preferences.</p>
                <Button variant="primary" onClick={() => setCurrentStep(1)}>
                  Back to Preferences
                </Button>
              </div>
            ) : (
              <>
                <Row>
                  {currentMovies.map((movie) => (
                    <Col key={movie.id} xs={6} sm={4} md={3} lg={2} className="mb-3">
                      <Card
                        onClick={() => toggleMovie(movie)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                        className={`h-100 ${isSelected(movie.id) ? 'border-primary border-3' : ''}`}
                      >
                        {isSelected(movie.id) && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: '#28a745',
                              borderRadius: '50%',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 10
                            }}
                          >
                            <FaCheck color="white" />
                          </div>
                        )}
                        <Card.Img
                          variant="top"
                          src={movie.poster_path ?
                            `${IMAGE_BASE}${movie.poster_path}` :
                            'https://via.placeholder.com/200x300?text=No+Image'
                          }
                          alt={movie.title}
                        />
                        <Card.Body className="p-2">
                          <Card.Title className="small mb-0" style={{ fontSize: '0.85rem', height: '2.5rem', overflow: 'hidden' }}>
                            {movie.title}
                          </Card.Title>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            ⭐ {movie.vote_average?.toFixed(1)}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination Controls */}
                <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft /> Previous
                  </Button>

                  <Pagination className="mb-0">
                {currentPage > 2 && (
                  <>
                    <Pagination.Item onClick={() => goToPage(1)}>1</Pagination.Item>
                    {currentPage > 3 && <Pagination.Ellipsis disabled />}
                  </>
                )}

                {currentPage > 1 && (
                  <Pagination.Item onClick={() => goToPage(currentPage - 1)}>
                    {currentPage - 1}
                  </Pagination.Item>
                )}

                <Pagination.Item active>{currentPage}</Pagination.Item>

                {currentPage < totalPages && (
                  <Pagination.Item onClick={() => goToPage(currentPage + 1)}>
                    {currentPage + 1}
                  </Pagination.Item>
                )}

                {currentPage < totalPages - 1 && (
                  <>
                    {currentPage < totalPages - 2 && <Pagination.Ellipsis disabled />}
                    <Pagination.Item onClick={() => goToPage(totalPages)}>
                      {totalPages}
                    </Pagination.Item>
                  </>
                )}
                  </Pagination>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next <FaChevronRight />
                  </Button>
                </div>

                <div className="text-center mt-3 text-muted small">
                  Showing {startIndex + 1}-{Math.min(endIndex, moviesToDisplay.length)} of {moviesToDisplay.length} movies
                </div>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <div>
          {currentStep === 2 && selectedMovies.length > 0 && (
            <small className="text-muted">
              Selected: {selectedMovies.map(m => m.title).slice(0, 2).join(', ')}
              {selectedMovies.length > 2 && ` +${selectedMovies.length - 2} more`}
            </small>
          )}
          {currentStep === 1 && selectedLanguages.length > 0 && (
            <small className="text-muted">
              {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''}, {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''}
            </small>
          )}
        </div>
        <div>
          {currentStep === 1 ? (
            <>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  onComplete();
                }}
                className="me-2"
              >
                Skip for Now
              </Button>
              <Button
                variant="primary"
                onClick={handleProceedToMovies}
                disabled={selectedGenres.length === 0}
              >
                {selectedGenres.length === 0
                  ? 'Select at least 1 genre'
                  : `Continue to Movies`}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-secondary"
                onClick={() => setCurrentStep(1)}
                className="me-2"
              >
                Back to Preferences
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSelectedMovies([]);
                  onComplete();
                }}
                className="me-2"
              >
                Skip Movies
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={selectedMovies.length === 0}
              >
                {selectedMovies.length === 0
                  ? 'Select at least 1 movie'
                  : selectedMovies.length < 3
                  ? `Continue (${selectedMovies.length}/3 minimum)`
                  : `Complete Setup`}
              </Button>
            </>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default OnboardingModal;
