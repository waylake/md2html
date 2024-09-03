let searchIndex = [];

async function loadSearchIndex() {
  const response = await fetch("/search-index.json");
  searchIndex = await response.json();
}

function search(query) {
  return searchIndex.filter(
    (post) =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.description.toLowerCase().includes(query.toLowerCase()) ||
      (post.categories &&
        post.categories.some((cat) =>
          cat.toLowerCase().includes(query.toLowerCase()),
        )),
  );
}

document.addEventListener("DOMContentLoaded", () => {
  loadSearchIndex();

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const content = document.getElementById("content");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value;
    const results = search(query);
    displayResults(results);
  });

  function displayResults(results) {
    searchResults.innerHTML = results
      .map(
        (post) => `
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title"><a href="${post.url}">${post.title}</a></h5>
            <h6 class="card-subtitle mb-2 text-muted">${new Date(post.date).toLocaleDateString()}</h6>
            <p class="card-text">${post.description}</p>
            <a href="${post.url}" class="btn btn-primary">Read More</a>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    // Hide original content and show search results
    content.style.display = "none";
    searchResults.style.display = "flex";
  }

  // Add event listener for clearing search
  searchInput.addEventListener("input", (e) => {
    if (e.target.value === "") {
      // Show original content and hide search results
      content.style.display = "flex";
      searchResults.style.display = "none";
    }
  });
});
