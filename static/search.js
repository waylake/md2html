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
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="post-card">
          <div class="post-card-image" style="background-image: url('${post.image || "/images/default-post-image.jpg"}');"></div>
          <div class="post-card-content">
            <h3 class="post-card-title">${post.title}</h3>
            <p class="post-card-excerpt">${truncate(post.description, 100)}</p>
            <div class="post-card-meta">
              <span class="post-card-date">
                <i class="far fa-calendar-alt"></i>
                ${formatDate(post.date)}
              </span>
              <div class="post-card-categories">
                ${post.categories
                  .map(
                    (category) => `
                  <span class="post-card-category">${category}</span>
                `,
                  )
                  .join("")}
              </div>
            </div>
            <a href="${post.url}" class="post-card-link">
              Read More <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    content.style.display = "none";
    searchResults.style.display = "flex";
  }

  searchInput.addEventListener("input", (e) => {
    if (e.target.value === "") {
      content.style.display = "flex";
      searchResults.style.display = "none";
    }
  });

  function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + "..." : str;
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }
});
