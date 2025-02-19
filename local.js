// TMDB API key (replace with your key if needed)
const apiKey = "8baba8ab6b8bbe247645bcae7df63d0d";

// Function to map TMDB genre IDs to names
function getGenreName(id, type) {
  const genreMap = {
    movie: {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    },
    tv: {
      10759: "Action & Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      10762: "Kids",
      9648: "Mystery",
      10763: "News",
      10764: "Reality",
      10765: "Sci-Fi & Fantasy",
      10766: "Soap",
      10767: "Talk",
      10768: "War & Politics",
      37: "Western",
    },
  };
  return genreMap[type]?.[id] || "Unknown";
}

// ========================
// Local Media (db.json)
// ========================
fetch("db.json")
  .then((response) => response.json())
  .then((data) => {
    const mediaGrid = document.getElementById("mediaGrid");
    // Combine TV shows and movies from your local JSON file
    const allMedia = [...data.tvShows, ...data.movies];
    allMedia.forEach((media) => {
      const col = document.createElement("div");
      col.className = "col";
      const card = document.createElement("div");
      card.className = "card media-card h-100";
      // Determine type based on available properties
      let type = media.episodes ? "tv" : "movie";
      const tmdbUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&query=${encodeURIComponent(
        media.title
      )}&year=${media.year || ""}`;
      fetch(tmdbUrl)
        .then((response) => response.json())
        .then((tmdbData) => {
          if (tmdbData.results && tmdbData.results.length > 0) {
            const result = tmdbData.results[0];
            const id = result.id;
            const poster = result.poster_path
              ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
              : "https://via.placeholder.com/300x450?text=No+Image";
            const title = result.title || result.name;
            const releaseYear =
              type === "tv"
                ? result.first_air_date
                  ? result.first_air_date.split("-")[0]
                  : "N/A"
                : result.release_date
                ? result.release_date.split("-")[0]
                : "N/A";
            const detailsUrl = `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=release_dates,content_ratings`;
            fetch(detailsUrl)
              .then((detailsResponse) => detailsResponse.json())
              .then((detailsData) => {
                const duration =
                  type === "movie" ? detailsData.runtime || "N/A" : null;
                let rating = "N/A";
                let country = "N/A";
                const userScore = detailsData.vote_average
                  ? `${detailsData.vote_average.toFixed(1)}/10`
                  : "N/A";
                if (type === "movie" && detailsData.release_dates) {
                  const usRelease = detailsData.release_dates.results.find(
                    (r) => r.iso_3166_1 === "US"
                  );
                  if (
                    usRelease &&
                    usRelease.release_dates &&
                    usRelease.release_dates.length > 0
                  ) {
                    rating = usRelease.release_dates[0].certification || "NR";
                  }
                } else if (type === "tv" && detailsData.content_ratings) {
                  const usRating = detailsData.content_ratings.results.find(
                    (r) => r.iso_3166_1 === "US"
                  );
                  if (usRating) {
                    rating = usRating.rating || "NR";
                  }
                }
                if (type === "tv") {
                  country = detailsData.origin_country
                    ? detailsData.origin_country.join(", ")
                    : "N/A";
                } else if (type === "movie") {
                  country = detailsData.production_countries
                    ? detailsData.production_countries
                        .map((c) => c.iso_3166_1)
                        .join(", ")
                    : "N/A";
                }
                const genres = result.genre_ids
                  ? result.genre_ids
                      .map((id) => getGenreName(id, type))
                      .join(", ")
                  : "N/A";
                card.innerHTML = `
                   <img src="${poster}" class="card-img-top" alt="${title}" />
                   <div class="card-body">
                     <h5 class="card-title">${title} (${releaseYear})</h5>
                     <p class="card-text film-info text-secondary">
                       <small>
                         ${genres}<br>${country} • ${rating} • ${userScore}${
                  duration ? ` • ${duration} min` : ""
                }
                       </small>
                     </p>
                     <a class="btn btn-primary w-100">
                       <i class="fa-solid fa-play"></i>
                       <span class="ms-2">Watch</span>
                     </a>
                   </div>
                 `;
                // When clicked, navigate to watch.html with query parameters
                card.querySelector("a").addEventListener("click", () => {
                  const queryString = new URLSearchParams({
                    title: media.title,
                    type: type,
                    year: media.year,
                    source: "db",
                  }).toString();
                  window.location.href = `watch.html?${queryString}`;
                });
                col.appendChild(card);
                mediaGrid.appendChild(col);
              })
              .catch((error) =>
                console.error("Error fetching media details:", error)
              );
          } else {
            console.error(`No TMDB data found for ${media.title}`);
          }
        })
        .catch((error) => console.error("Error fetching TMDB data:", error));
    });
  })
  .catch((error) => console.error("Error fetching JSON data:", error));
