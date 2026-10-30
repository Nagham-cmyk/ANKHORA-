
// Mobile Menu

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", function() {
    navLinks.classList.toggle("active");
});

// Close Menu After Clicking a Link

const links = document.querySelectorAll(".nav-links a");

links.forEach(function(link) {
    link.addEventListener("click", function() {
        navLinks.classList.remove("active");
    });
});

// Search Artifacts

const searchInput = document.getElementById("searchInput");

const artifactCards = document.querySelectorAll(".artifact-card");

searchInput.addEventListener("input", function() {

    const searchValue = searchInput.value.toLowerCase();

    artifactCards.forEach(function(card) {

        const artifactName =
            card.querySelector("h3").textContent.toLowerCase();

        const artifactInfo =
            card.querySelector("p").textContent.toLowerCase();

        if (
            artifactName.includes(searchValue) ||
            artifactInfo.includes(searchValue)
        ) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});
