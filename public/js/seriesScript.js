let currentEditId = null;
let allSeries = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchSeries();

  const modal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".modal .close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.getElementById("saveEditBtn").addEventListener("click", saveEditedSerie);
});

function fetchSeries() {
  console.log("Fetching series...");

  fetch("http://localhost:3000/api/series")
    .then(response => response.json())
    .then(data => {
      console.log("Series fetched:", data);

      if (!Array.isArray(data.series)) {
        console.error("Error: Series is not an array!", data);
        return;
      }

      const series = data.series;
      const tableBody = document.querySelector("#table tbody");

      tableBody.innerHTML = `
          <tr id="new-table-row">
            <td><input type="text" id="serieName" placeholder="Serie Name"></td>
            <td>
              <select id="serieStatus">
                <option value="" disabled selected hidden>Status</option>
                <option value="PLANNING">PLANNING</option>
                <option value="WATCHING">WATCHING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </td>
            <td><input type="number" id="serieSeason" placeholder="Season" min="1"></td>
            <td><input type="number" id="serieEpisode" placeholder="Episode" min="1"></td>
            <td><input type="number" id="serieRate" placeholder="Rate" min="1" max="10"></td>
            <td>
              <button id="addSerieBtn">ADD</button>
              <button id="searchSerieBtn">SEARCH</button>
              <button id="clearSerieBtn">CLEAR</button>
            </td>
          </tr>
        `;

      series.forEach(serie => {
        const row = document.createElement("tr");
        const rowId = serie.ROWID || serie.rowid;
        row.setAttribute("data-id", rowId);

        row.innerHTML = `
            <td class="serie-name">${serie.name}</td>
            <td class="serie-status">${serie.status}</td>
            <td class="serie-season">${serie.season}</td>
            <td class="serie-episode">${serie.episode}</td>
            <td class="serie-rate">${serie.rate}</td>
            <td>
              <button class="editBtn">Edit</button>
              <button class="deleteBtn">Delete</button>
            </td>
          `;
        tableBody.appendChild(row);
      });

      attachRowEventListeners();

      document.getElementById("addSerieBtn").addEventListener("click", addSerie);
      document.getElementById("searchSerieBtn").addEventListener("click", searchSeries);
      document.getElementById("clearSerieBtn").addEventListener("click", clearSearchFields);
    })
    .catch(error => console.error("Error fetching series:", error));
}

function searchSeries() {
  const name = document.getElementById("serieName").value.trim().toLowerCase();
  const status = document.getElementById("serieStatus").value.trim().toLowerCase();
  const season = document.getElementById("serieSeason").value.trim();
  const episode = document.getElementById("serieEpisode").value.trim();
  const rate = document.getElementById("serieRate").value.trim();

  document.querySelectorAll("#table tbody tr").forEach(row => {
    if (row.id === "new-table-row") return;
    
    const rowName = row.querySelector(".serie-name").innerText.trim().toLowerCase();
    const rowStatus = row.querySelector(".serie-status").innerText.trim().toLowerCase();
    const rowSeason = row.querySelector(".serie-season").innerText.trim();
    const rowEpisode = row.querySelector(".serie-episode").innerText.trim();
    const rowRate = row.querySelector(".serie-rate").innerText.trim();

    const matches = (
      (!name || rowName.includes(name)) &&
      (!status || rowStatus.includes(status)) &&
      (!season || rowSeason.includes(season)) &&
      (!episode || rowEpisode.includes(episode)) &&
      (!rate || rowRate.includes(rate))
    );

    row.style.display = matches ? "table-row" : "none";
  });
}

function clearSearchFields() {
  document.getElementById("serieName").value = "";
  document.getElementById("serieStatus").value = "";
  document.getElementById("serieSeason").value = "";
  document.getElementById("serieEpisode").value = "";
  document.getElementById("serieRate").value = "";
  fetchSeries();
}

function attachRowEventListeners() {
  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      currentEditId = row.getAttribute("data-id");
      
      document.getElementById("editSerieName").value = row.querySelector(".serie-name").innerText.trim();
      document.getElementById("editSerieStatus").value = row.querySelector(".serie-status").innerText.trim();
      document.getElementById("editSerieSeason").value = row.querySelector(".serie-season").innerText.trim();
      document.getElementById("editSerieEpisode").value = row.querySelector(".serie-episode").innerText.trim();
      document.getElementById("editSerieRate").value = row.querySelector(".serie-rate").innerText.trim();
      
      document.getElementById("editModal").style.display = "block";
    });
  });

  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", deleteSerie);
  });
}

function saveEditedSerie() {
  const name = document.getElementById("editSerieName").value;
  const status = document.getElementById("editSerieStatus").value;
  const season = document.getElementById("editSerieSeason").value;
  const episode = document.getElementById("editSerieEpisode").value;
  const rate = document.getElementById("editSerieRate").value;

  if (!currentEditId) {
    alert("No serie selected for editing.");
    return;
  }

  const updatedSerie = { name, status, season, episode, rate };

  fetch(`http://localhost:3000/api/series/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedSerie)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update serie");
      }
      return response.json();
    })
    .then(data => {
      alert("Serie updated successfully!");
      document.getElementById("editModal").style.display = "none";
      fetchSeries();
    })
    .catch(error => {
      console.error("Error updating serie:", error);
      alert("Error updating serie");
    });
}

function saveSerie(event) {
  const row = event.target.closest("tr");
  const id = row.getAttribute("data-id");

  const updatedSerie = {
    name: row.querySelector(".serie-name").innerText.trim(),
    status: row.querySelector(".serie-status").innerText.trim(),
    season: row.querySelector(".serie-season").innerText.trim(),
    episode: row.querySelector(".serie-episode").innerText.trim(),
    rate: row.querySelector(".serie-rate").innerText.trim()
  };

  fetch(`http://localhost:3000/api/series/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedSerie)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to update serie");
      }
      return response.json();
    })
    .then(data => {
      alert("Serie updated successfully!");
      fetchSeries();
    })
    .catch(error => {
      console.error("Error updating serie:", error);
      alert("Error updating serie");
    });
}

function deleteSerie(event) {
  const row = event.target.closest("tr");
  const id = row.getAttribute("data-id");

  if (!id) {
    alert("Error: Invalid serie ID.");
    return;
  }

  fetch(`http://localhost:3000/api/series/${id}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete serie");
      }
      return response.text();
    })
    .then(() => {
      alert("Serie deleted successfully!");
      fetchSeries();
    })
    .catch(error => {
      console.error("Error deleting serie:", error);
      alert("Error deleting serie");
    });
}

function addSerie() {
  if (!document.getElementById("serieName")) {
    console.error("Error: Required input fields are missing in the DOM.");
    return;
  }

  const name = document.getElementById("serieName").value.trim();
  const status = document.getElementById("serieStatus").value;
  let season = document.getElementById("serieSeason").value.trim();
  let episode = document.getElementById("serieEpisode").value.trim();
  let rate = document.getElementById("serieRate").value.trim();

  if (!name || !status) {
    alert("Please fill in the serie name and status.");
    return;
  }

  if (status === "COMPLETED") {
    if (!rate) {
      alert("Please provide a rate for a completed serie.");
      return;
    }
    rate = Number(rate);
    if (isNaN(rate)) {
      alert("Rate must be a valid number.");
      return;
    }
  } else {
    rate = null;
  }

  if (status === "WATCHING") {
    if (!season || !episode) {
      alert("Please provide a season and episode for a watching serie.");
      return;
    }
    season = Number(season);
    episode = Number(episode);
    if (isNaN(season) || isNaN(episode) || season < 1 || episode < 1) {
      alert("Season and episode must have numbers.");
      return;
    }
  } else {
    season = null;
    episode = null;
  }

  const requestBody = { name, status, season, episode, rate };

  console.log("Sending data:", JSON.stringify(requestBody)); // ✅ Log the data being sent

  fetch("http://localhost:3000/api/series", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then(async (response) => {
      console.log("Response Status:", response.status);

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || JSON.stringify(errorData);
        } else {
          errorMessage = await response.text();
        }

        if (response.status === 400 && errorMessage.includes("exists")) {
          alert("This serie already exists.");
        } else {
          alert(errorMessage || "Unknown error occurred.");
        }
        throw new Error(errorMessage || "Unknown error");
      }

      return response.json();
    })
    .then(data => {
      console.log("Server Response:", data); // ✅ Log response data
      if (data.serie) {
        alert("Serie added successfully!");
        fetchSeries();
      } else {
        alert("Error: Failed to add serie.");
      }
    })
    .catch(error => {
      console.error(error);
    });
}