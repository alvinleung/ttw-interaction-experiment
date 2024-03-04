import { createDotGridInteraction } from "./dotGridInteraction/DotGridInteraction";

window.addEventListener("load", () => {
  // init
  const imageLinkElm = document.querySelector(".image-link");
  const bounds = imageLinkElm?.getBoundingClientRect() as DOMRect;
  const gridInteraction = createDotGridInteraction(
    imageLinkElm as HTMLElement,
    bounds.width,
    bounds.height
  );
});
