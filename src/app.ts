import { setupDotGridInteraction } from "./dotGridInteraction/DotGridInteraction";

let dotGridCleanup;
window.addEventListener("resize", () => {
  if (dotGridCleanup) dotGridCleanup();
  dotGridCleanup = setupAllDotGridInteraction();
});

window.addEventListener("load", () => {
  if (dotGridCleanup) dotGridCleanup();
  dotGridCleanup = setupAllDotGridInteraction();
});

const setupAllDotGridInteraction = () => {
  // init
  const imageLinkElms = [...document.querySelectorAll(".image-link")];
  const cleanups = imageLinkElms.map((imageLinkElm) => {
    const labelCopy = imageLinkElm.querySelector(".label");

    return setupDotGridInteraction(
      imageLinkElm as HTMLElement,
      75,
      5.5,
      labelCopy?.innerHTML,
      "rgb(192, 196, 213)",
      labelCopy?.innerHTML.toLowerCase() === "coming soon"
        ? "rgba(192, 196, 213,.5)"
        : "rgba(170, 244, 105, 1)"
    );
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
