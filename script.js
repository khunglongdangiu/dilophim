document.addEventListener("DOMContentLoaded", function () {
  // Check if dark mode is already set in localStorage
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("theme-toggle").innerText = "🌞"; // Switch to light mode icon
  }

  // Theme toggle button click handler
  document
    .getElementById("theme-toggle")
    .addEventListener("click", function () {
      // Toggle dark mode
      document.body.classList.toggle("dark-mode");

      // Update localStorage based on the current theme
      if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        this.innerText = "🌞"; // Switch to light mode icon
      } else {
        localStorage.setItem("theme", "light");
        this.innerText = "🌙"; // Switch to dark mode icon
      }
    });
});
