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
      8,
      labelCopy?.innerHTML
    );
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
};
