let currentEditId = null; // To store the movie id currently being edited
let allMovies = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();

  // Set up modal close functionality
  const modal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".modal .close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // When clicking outside the modal content, close modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Set up Save Changes button in modal
  document.getElementById("saveEditBtn").addEventListener("click", saveEditedMovie);
});

function fetchMovies() {
  console.log("Fetching movies...");

  fetch("http://localhost:3000/api/movies")
    .then(response => response.json())
    .then(data => {
      console.log("Movies fetched:", data);

      if (!Array.isArray(data.movies)) {
        console.error("Error: Movies is not an array!", data);
        return;
      }

      const movies = data.movies;
      const tableBody = document.querySelector("#table tbody");

      // Re-add the new movie input row
      tableBody.innerHTML = `
          <tr id="new-table-row">
            <td><input type="text" id="movieName" placeholder="Movie Name"></td>
            <td>
              <select id="movieStatus">
                <option value="" disabled selected hidden>Status</option>
                <option value="PLANNING">PLANNING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </td>
            <td>
              <input type="number" id="movieRate" placeholder="Rate" min="1" max="10">
            </td>
            <td>
              <button id="addMovieBtn">ADD</button>
              <button id="searchMovieBtn">SEARCH</button>
              <button id="clearMovieBtn">CLEAR</button>
            </td>
          </tr>
        `;

      movies.forEach(movie => {
        const row = document.createElement("tr");
        const rowId = movie.ROWID || movie.rowid;
        row.setAttribute("data-id", rowId);

        row.innerHTML = `
            <td class="movie-name">${movie.name}</td>
            <td class="movie-status">${movie.status}</td>
            <td class="movie-rate">${movie.rate}</td>
            <td>
              <button class="editBtn">Edit</button>
              <button class="deleteBtn">Delete</button>
            </td>
          `;
        tableBody.appendChild(row);
      });

      attachRowEventListeners();

      document.getElementById("addMovieBtn").addEventListener("click", addMovie);
      document.getElementById("searchMovieBtn").addEventListener("click", searchMovies);
      document.getElementById("clearMovieBtn").addEventListener("click", clearSearchFields);
    })
    .catch(error => console.error("Error fetching movies:", error));
}

function searchMovies() {
  const name = document.getElementById("movieName").value.toLowerCase();
  const status = document.getElementById("movieStatus").value.toLowerCase();
  const rate = document.getElementById("movieRate").value;

  document.querySelectorAll("#table tbody tr").forEach(row => {
    if (row.id === "new-table-row") return; // Skip the input row
    
    const rowName = row.querySelector(".movie-name").innerText.toLowerCase();
    const rowStatus = row.querySelector(".movie-status").innerText.toLowerCase();
    const rowRate = row.querySelector(".movie-rate").innerText;

    const matches = (
      (!name || rowName.includes(name)) &&
      (!status || rowStatus.includes(status)) &&
      (!rate || rowRate === rate)
    );
    
    row.style.display = matches ? "table-row" : "none";
  });
}

function clearSearchFields() {
  document.getElementById("movieName").value = "";
  document.getElementById("movieStatus").value = "";
  document.getElementById("movieRate").value = "";
  fetchMovies();
}

function attachRowEventListeners() {
  // Edit button: open modal and pre-fill with row values
  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      currentEditId = row.getAttribute("data-id");
      // Pre-fill modal inputs with the row's values
      document.getElementById("editMovieName").value = row.querySelector(".movie-name").innerText.trim();
      document.getElementById("editMovieStatus").value = row.querySelector(".movie-status").innerText.trim();
      document.getElementById("editMovieRate").value = row.querySelector(".movie-rate").innerText.trim();
      // Show modal
      document.getElementById("editModal").style.display = "block";
    });
  });

  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", deleteMovie);
  });
}

function saveEditedMovie() {
  // Get updated values from modal inputs
  const name = document.getElementById("editMovieName").value;
  const status = document.getElementById("editMovieStatus").value;
  const rate = document.getElementById("editMovieRate").value;

  if (!currentEditId) {
    alert("No movie selected for editing.");
    return;
  }

  const updatedMovie = { name, status, rate };

  fetch(`http://localhost:3000/api/movies/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedMovie)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update movie");
      }
      return response.json();
    })
    .then(data => {
      alert("Movie updated successfully!");
      document.getElementById("editModal").style.display = "none";
      fetchMovies();
    })
    .catch(error => {
      console.error("Error updating movie:", error);
      alert("Error updating movie");
    });
}

// Existing functions for inline save and delete (if needed)
function saveMovie(event) {
  const row = event.target.closest("tr");
  const id = row.getAttribute("data-id");

  const updatedMovie = {
    name: row.querySelector(".movie-name").innerText.trim(),
    status: row.querySelector(".movie-status").innerText.trim(),
    rate: row.querySelector(".movie-rate").innerText.trim()
  };

  fetch(`http://localhost:3000/api/movies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedMovie)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update movie");
      }
      return response.json();
    })
    .then(data => {
      alert("Movie updated successfully!");
      fetchMovies();
    })
    .catch(error => {
      console.error("Error updating movie:", error);
      alert("Error updating movie");
    });
}

function deleteMovie(event) {
  const row = event.target.closest("tr");
  const id = row.getAttribute("data-id");

  if (!id) {
    alert("Error: Invalid movie ID.");
    return;
  }

  fetch(`http://localhost:3000/api/movies/${id}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete movie");
      }
      return response.text();
    })
    .then(() => {
      alert("Movie deleted successfully!");
      fetchMovies();
    })
    .catch(error => {
      console.error("Error deleting movie:", error);
      alert("Error deleting movie");
    });
}

function addMovie() {
  const name = document.getElementById("movieName").value.trim();
  const status = document.getElementById("movieStatus").value;
  let rate = document.getElementById("movieRate").value.trim();

  // Check that name and status are provided.
  if (!name || !status) {
    alert("Please fill in the movie name and status.");
    return;
  }

  // If status is COMPLETED, then a numeric rate is required.
  if (status === "COMPLETED") {
    if (!rate) {
      alert("Please provide a rate for a completed movie.");
      return;
    }
    rate = Number(rate);
    if (isNaN(rate)) {
      alert("Rate must be a valid number.");
      return;
    }
  } else {
    // For non-COMPLETED movies, you may choose to ignore the rate.
    rate = null;
  }

  fetch("http://localhost:3000/api/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, status, rate })
  })
    .then(response => {
      if (!response.ok) {
        // Return or parse JSON error
        return response.json().then(err => {
          throw new Error(err.error || "Unknown error");
        });
      }
      return response.json(); // Only parse JSON if OK
    })
    .then(data => {
      if (data.movie) {
        alert("Movie added successfully!");
        fetchMovies();
      } else {
        alert("Error: Failed to add movie.");
      }
    })
    .catch(error => console.error("Error adding movie:", error));
}