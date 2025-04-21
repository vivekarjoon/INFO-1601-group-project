// === Firebase Config ===
const firebaseConfig = {
    apiKey: "AIzaSyDK7mMfZ-5Zv-hjtWv0Hk_Mu0ewXjgSwgA",
    authDomain: "moodflix-cookiemonsters.firebaseapp.com",
    projectId: "moodflix-cookiemonsters",
    storageBucket: "moodflix-cookiemonsters.appspot.com",
    messagingSenderId: "200778906924",
    appId: "1:200778906924:web:some-random-id"
  };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
  
    // UI Elements
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginError = document.getElementById("login-error");
    const loginContainer = document.getElementById("login-container");
    const mainApp = document.getElementById("main-app");
    const recommendOptions = document.getElementById("recommend-options");
    const moviesContainer = document.getElementById("movies");
    const moviesSection = document.getElementById("movies-section");
    const bookmarksContainer = document.getElementById("bookmarks");
    const noBookmarksMsg = document.getElementById("no-bookmarks");
    const clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
    clickSound.volume = 0.3;
  
    let selectedMood = "";
    let currentUser = null;
  
    // Initialize the app
    function init() {
      // Check if user is already logged in
      auth.onAuthStateChanged(user => {
        if (user) {
          currentUser = user;
          loginContainer.style.display = "none";
          mainApp.style.display = "block";
          loadBookmarks();
        }
      });
    }
  
    // LOGIN
    function login() {
      const email = usernameInput.value;
      const password = passwordInput.value;
  
      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          currentUser = userCredential.user;
          loginContainer.style.display = "none";
          mainApp.style.display = "block";
          loginError.textContent = "";
          loadBookmarks();
        })
        .catch((error) => {
          loginError.textContent = error.message;
        });
    }
  
    // LOGOUT
    function logout() {
      auth.signOut().then(() => {
        currentUser = null;
        mainApp.style.display = "none";
        loginContainer.style.display = "block";
        usernameInput.value = "";
        passwordInput.value = "";
      });
    }
  
    // MOOD SELECTION
    function selectMood(mood) {
      clickSound.currentTime = 0;
      clickSound.play()
      document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
      });
  
      // Add to clicked button
      event.target.classList.add('selected');
  
      selectedMood = mood;
      recommendOptions.style.display = "block";
      moviesSection.style.display = "none";
    }
    // FETCH MOVIES
    function fetchMovies(strategy) {
      const TMDB_API_KEY = "180431d159425bad2912e573b8cca0a3";
  
      const moodToGenre = {
        happy: { match: 35, boost: 18 },
        sad: { match: 18, boost: 35 },
        angry: { match: 28, boost: 10749 },
        bored: { match: 9648, boost: 12 },
        tired: { match: 10749, boost: 28 },
        romantic: {
          match: { genre: 10749 },           // Just use erotic keyword alone
          boost: { genre: 10749, voteAverageGTE: 7.0 }  // Keep boost as it is
        }
      };
  
      const moodSetting = moodToGenre[selectedMood][strategy];
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}`;
  
      if (typeof moodSetting === "number") {
        url += `&with_genres=${moodSetting}`;
      } else {
        if (moodSetting.genre) {
          url += `&with_genres=${moodSetting.genre}`;
        }
        if (moodSetting.keyword) {
          url += `&with_keywords=${moodSetting.keyword}`;
        }
        if (moodSetting.voteAverageGTE) {
          url += `&vote_average.gte=${moodSetting.voteAverageGTE}`;
        }
      }
  
      url += "&sort_by=popularity.desc";
  
      // Show loading UI
      moviesContainer.innerHTML = "<div class='loading'>Loading movies...</div>";
      moviesSection.style.display = "block";
  
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 12));
          } else {
            moviesContainer.innerHTML = "<div class='no-results'>No movies found. Try another mood!</div>";
          }
        })
        .catch(() => {
          moviesContainer.innerHTML = "<div class='error-msg'>Failed to load movies. Please try again later.</div>";
        });
    }
  
      // Show loading state
      moviesContainer.innerHTML = "<div class='loading'>Loading movies...</div>";
      moviesSection.style.display = "block";
  
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            displayMovies(data.results.slice(0, 12));
          } else {
            moviesContainer.innerHTML = "<div class='no-results'>No movies found. Try another mood!</div>";
          }
        })
        .catch(() => {
          moviesContainer.innerHTML = "<div class='error-msg'>Failed to load movies. Please try again later.</div>";
        });
  
  
    // DISPLAY MOVIES
    function displayMovies(movies) {
      moviesContainer.innerHTML = "";
  
      movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
  
        const posterPath = movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster';
  
        movieCard.innerHTML = `
          <img class="movie-poster" src="${posterPath}" alt="${movie.title}"/>
          <div class="movie-info">
            <h4 class="movie-title">${movie.title}</h4>
            <p class="movie-overview">${movie.overview || "No description available."}</p>
            <div class="movie-actions">
              <button class="action-btn bookmark-btn" onclick='bookmarkMovie(${JSON.stringify({
                id: movie.id,
                title: movie.title,
                poster: movie.poster_path
              })})'>
                <i class="fas fa-bookmark"></i> Save
              </button>
              <button class="action-btn trailer-btn" onclick='watchTrailer(${movie.id})'>
                <i class="fas fa-play"></i> Trailer
              </button>
            </div>
          </div>
        `;
  
        moviesContainer.appendChild(movieCard);
      });
    }
  
  // Add to your existing handleKeyDown function:
  function handleKeyDown(event) {
    if (event.key === "Escape") {
      closeMovieDetails();
      closeTrailer();
    }
  }
  
    // BOOKMARK MOVIE
    function bookmarkMovie(movie) {
      if (!currentUser) return;
  
      // Check if movie is already bookmarked
      const bookmarks = Array.from(bookmarksContainer.querySelectorAll("li"));
      const alreadyBookmarked = bookmarks.some(li => li.dataset.movieId === movie.id.toString());
  
      if (alreadyBookmarked) {
        alert("This movie is already in your bookmarks!");
        return;
      }
  
      const li = document.createElement("li");
      li.dataset.movieId = movie.id;
  
      li.innerHTML = `
        <span>${movie.title}</span>
        <button class="remove-bookmark" onclick='removeBookmark(this, ${movie.id})'>
          <i class="fas fa-trash"></i>
        </button>
      `;
  
      bookmarksContainer.appendChild(li);
      noBookmarksMsg.style.display = "none";
      showConfetti();
  
      // Save to Firestore
      db.collection("users").doc(currentUser.uid).collection("bookmarks").doc(movie.id.toString()).set({
        title: movie.title,
        poster: movie.poster,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  
    // REMOVE BOOKMARK
    function removeBookmark(button, movieId) {
      const li = button.parentElement;
      li.remove();
  
      // Remove from Firestore
      if (currentUser) {
        db.collection("users").doc(currentUser.uid).collection("bookmarks").doc(movieId.toString()).delete();
      }
  
      // Show "no bookmarks" message if empty
      if (bookmarksContainer.children.length === 0) {
        noBookmarksMsg.style.display = "block";
      }
    }
  
    // LOAD BOOKMARKS
    function loadBookmarks() {
      if (!currentUser) return;
  
      bookmarksContainer.innerHTML = "";
  
      db.collection("users").doc(currentUser.uid).collection("bookmarks").get()
        .then(querySnapshot => {
          if (querySnapshot.empty) {
            noBookmarksMsg.style.display = "block";
            return;
          }
  
          noBookmarksMsg.style.display = "none";
  
          querySnapshot.forEach(doc => {
            const movie = doc.data();
            const li = document.createElement("li");
            li.dataset.movieId = doc.id;
  
            li.innerHTML = `
              <span>${movie.title}</span>
              <button class="remove-bookmark" onclick='removeBookmark(this, ${doc.id})'>
                <i class="fas fa-trash"></i>
              </button>
            `;
  
            bookmarksContainer.appendChild(li);
          });
        })
        .catch(error => {
          console.error("Error loading bookmarks:", error);
          noBookmarksMsg.style.display = "block";
          noBookmarksMsg.textContent = "Failed to load bookmarks.";
        });
    }
  
    // WATCH TRAILER
    function watchTrailer(movieId) {
      const TMDB_API_KEY = "180431d159425bad2912e573b8cca0a3";
      const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`;
  
      // Show loading state in modal
      const modal = document.getElementById("trailer-modal");
      modal.innerHTML = `
        <div style="color: white; font-size: 1.2rem; text-align: center; padding: 2rem;">
          Loading trailer...
        </div>
      `;
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
  
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const trailer = data.results.find(video => 
            video.type === "Trailer" && video.site === "YouTube"
          );
  
          if (trailer) {
            const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            showTrailerModal(youtubeUrl);
          } else {
            closeTrailer();
            alert("Sorry, no trailer available for this movie.");
          }
        })
        .catch(() => {
          closeTrailer();
          alert("Failed to load trailer. Please try again later.");
        });
    }
  
    // SHOW TRAILER MODAL
    function showTrailerModal(youtubeUrl) {
      const modal = document.getElementById("trailer-modal");
  
      // Restore the modal content
      modal.innerHTML = `
        <div id="trailer-overlay" onclick="closeTrailer()"></div>
        <div id="trailer-box" class="card">
          <button class="close-btn" onclick="closeTrailer()" aria-label="Close trailer">
            <i class="fas fa-times"></i>
          </button>
          <iframe id="trailer-frame" width="560" height="315" frameborder="0" allowfullscreen></iframe>
        </div>
      `;
  
      document.getElementById("trailer-frame").src = youtubeUrl;
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
  
      // Add keyboard event listener
      document.addEventListener("keydown", handleKeyDown);
    }
  
    // CLOSE TRAILER MODAL
    function closeTrailer() {
      const modal = document.getElementById("trailer-modal");
      const iframe = document.getElementById("trailer-frame");
  
      if (iframe) {
        iframe.src = "";
      }
  
      modal.style.display = "none";
      document.body.style.overflow = "auto";
  
      // Remove keyboard event listener
      document.removeEventListener("keydown", handleKeyDown);
    }
  
    // HANDLE KEYBOARD EVENTS
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeTrailer();
      }
    }
    function showConfetti() {
      const canvas = document.getElementById('confetti-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      const particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 8 + 3,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          speed: Math.random() * 3 + 2
        });
      }
  
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let stillActive = false;
  
        particles.forEach(p => {
          p.y += p.speed;
          if (p.y < canvas.height) stillActive = true;
  
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });
  
        if (stillActive) requestAnimationFrame(animate);
      }
  
      animate();
    }
  
    // Initialize the app when DOM is loaded
    document.addEventListener("DOMContentLoaded", init);