const stones = document.querySelectorAll(".stone-portal");

stones.forEach((stone) => {
  stone.addEventListener("click", () => {
    const target = stone.dataset.target;

    if (target) {
      window.location.href = target;
    }
  });
});