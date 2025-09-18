/** Highlights the word "join" in all p-tags */
function highlightJoin() {
  const pTags = document.querySelectorAll("p");

  pTags.forEach((pTag) => {
    pTag.innerHTML = pTag.textContent.replace(
      /(join)/gi,
      '<span class="join-hl">$1</span>'
    );
  });
}