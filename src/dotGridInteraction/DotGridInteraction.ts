import { onChangeAny, state } from "../utils/state";
import { map } from "../utils/utils";
import { iterateGrid, Grid, createGrid, GridItem } from "./grid";
import { triggerShuffleAnimation } from "./shuffleTextAnimation";

export function setupDotGridInteraction(
  baseElm: HTMLElement,
  dotInterval = 75,
  dotSize = 8,
  label = "Label",
  defaultColor = "rgb(192, 196, 213)",
  accentColor = "rgba(170, 244, 105, 1)"
) {
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns, "svg");
  const bounds = baseElm.getBoundingClientRect() as DOMRect;
  const width = bounds.width;
  const height = bounds.height;

  svg.setAttributeNS(null, "width", width.toString());
  svg.setAttributeNS(null, "height", height.toString());

  // svg.setAttributeNS(null, "viewBox", `0 0 ${width + 8} ${height + 8}`);

  svg.style.position = "absolute";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.top = "0px";
  svg.style.left = "0px";
  svg.style.overflow = "visible";

  baseElm.appendChild(svg);

  let dotGrid = createDotGrid(
    svg,
    width,
    height,
    dotInterval,
    dotSize,
    label,
    defaultColor,
    accentColor
  );

  return dotGrid.cleanup;
}

export interface Dot extends GridItem {
  size: number;
  x: number;
  y: number;
  elm: SVGRectElement;
  linkElm: SVGLineElement;
}

function createDotGrid(
  svg: SVGSVGElement,
  width: number,
  height: number,
  interval = 75,
  dotSize = 8,
  label = "hello",
  defaultColor = "rgb(192, 196, 213)",
  accentColor = "rgba(170, 244, 105, 1)"
) {
  const isActive = state(false);
  const mousePos = state({ x: 0, y: 0 });
  const isMouseDown = state(false);

  const cols = Math.floor(width / interval);
  const rows = Math.floor(height / interval);

  const dotElmColInterval = Math.round((width - dotSize) / (cols - 1));
  const dotElmRowInterval = Math.round((height - dotSize) / (rows - 1));

  const grid = createGrid<Dot>(cols, rows, ({ col, row }) => {
    const x = col * dotElmColInterval;
    const y = row * dotElmRowInterval;
    const dotElm = createDotElm(x, y, dotSize, defaultColor);
    const dotLink = createDotLink(x, y, defaultColor);

    svg.appendChild(dotElm);
    svg.appendChild(dotLink);

    return { size: dotSize, col, row, elm: dotElm, linkElm: dotLink, x, y };
  });

  const textLabel = createLabel(label);
  svg.appendChild(textLabel);

  const elmBounds = svg.getBoundingClientRect();

  // update scroll position for the document
  let scrollY = window.scrollY;
  const handleScroll = () => {
    scrollY = window.scrollY;
  };

  const boundsX = elmBounds.x;
  const boundsY = elmBounds.y + window.scrollY;

  window.addEventListener("scroll", handleScroll);

  const handleMouseMove = (e: MouseEvent) => {
    const offsetX = e.clientX - boundsX;
    const offsetY = e.clientY - (boundsY - scrollY);

    mousePos.set({ x: offsetX, y: offsetY });
  };

  let cancelShuffleAnimation = () => {};
  const handleMouseEnter = (e: MouseEvent) => {
    isActive.set(true);
    cancelShuffleAnimation();
    cancelShuffleAnimation = triggerShuffleAnimation(textLabel, label);
  };
  const handleMouseLeave = (e: MouseEvent) => {
    isActive.set(false);
    cancelShuffleAnimation();
  };

  const cleanupMouseState = onChangeAny(
    mousePos,
    isActive,
    isMouseDown
  )((mousePos, isActive, isMouseDown) => {
    textLabel.style.transform = `translate(${mousePos.x}px, ${mousePos.y}px)`;
    if (!isActive) {
      grid.items.forEach((dot) =>
        updateDot(
          dot,
          mousePos.x,
          mousePos.y,
          false,
          isMouseDown,
          defaultColor,
          accentColor,
          label
        )
      );
      textLabel.style.opacity = "0";
      return;
    }
    textLabel.style.opacity = `1`;
    grid.items.forEach((dot) =>
      updateDot(
        dot,
        mousePos.x,
        mousePos.y,
        true,
        isMouseDown,
        defaultColor,
        accentColor,
        label
      )
    );
  });

  let mouseDownTimeout;
  const MOUSE_UP_DELAY = 270;
  let mouseDownTime = Date.now();

  const handleMouseDown = () => {
    isMouseDown.set(true);
    mouseDownTime = Date.now();
  };

  const handleMouseUp = () => {
    if (mouseDownTimeout) clearTimeout(mouseDownTimeout);
    const elapsedSinceMouseDown = Date.now() - mouseDownTime;

    mouseDownTimeout = setTimeout(
      () => isMouseDown.set(false),
      Math.max(0, MOUSE_UP_DELAY - elapsedSinceMouseDown)
    );
  };

  svg.addEventListener("pointermove", handleMouseMove);
  svg.addEventListener("pointerenter", handleMouseEnter);
  svg.addEventListener("pointerleave", handleMouseLeave);
  svg.addEventListener("pointerdown", handleMouseDown);
  svg.addEventListener("pointerup", handleMouseUp);

  const cleanup = () => {
    svg.removeEventListener("pointermove", handleMouseMove);
    svg.removeEventListener("pointerenter", handleMouseEnter);
    svg.removeEventListener("pointerleave", handleMouseLeave);
    svg.removeEventListener("pointerdown", handleMouseDown);
    svg.removeEventListener("pointerup", handleMouseUp);
    window.removeEventListener("scroll", handleScroll);
    cleanupMouseState();

    //TODO: remove dotLink
    //TODO: remove dotElms
    svg.innerHTML = "";
  };

  // renderDotGrid(grid);
  return {
    grid,
    cleanup,
  };
}

function createDotElm(x: number, y: number, size: number, color: string) {
  const svgns = "http://www.w3.org/2000/svg";
  const dotElm = document.createElementNS(svgns, "rect") as SVGRectElement;

  dotElm.setAttributeNS(null, "width", `${size}`);
  dotElm.setAttributeNS(null, "height", `${size}`);
  dotElm.setAttributeNS(null, "x", `${x}`);
  dotElm.setAttributeNS(null, "y", `${y}`);

  dotElm.style.opacity = "0";
  // dotElm.setAttributeNS(null, "fill", `${color}`);

  // dotElm.style.transition = `transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)`;

  return dotElm;
}

function createLabel(text: string) {
  const svgns = "http://www.w3.org/2000/svg";
  const textElm = document.createElementNS(svgns, "text") as SVGTextElement;

  textElm.setAttributeNS(null, "x", `${0}`);
  textElm.setAttributeNS(null, "y", `${0}`);
  textElm.setAttributeNS(null, "fill", `#FFF`);
  textElm.setAttributeNS(null, "font-size", `16px`);

  textElm.style.pointerEvents = "none";
  textElm.style.userSelect = "none";
  textElm.style.opacity = "0";
  // textElm.style.transition = "transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)";
  textElm.innerHTML = text;

  return textElm;
}

function createDotLink(x: number, y: number, color: string) {
  const svgns = "http://www.w3.org/2000/svg";
  const dotLink = document.createElementNS(svgns, "line") as SVGLineElement;

  dotLink.setAttributeNS(null, "x1", `${x + 4}`);
  dotLink.setAttributeNS(null, "y1", `${y + 4}`);
  dotLink.setAttributeNS(null, "x2", `${x}`);
  dotLink.setAttributeNS(null, "y2", `${y}`);
  dotLink.setAttributeNS(null, "stroke", `${color}`);

  dotLink.style.strokeWidth = "1.5";
  dotLink.style.strokeDasharray = "2";
  dotLink.style.opacity = "0";

  return dotLink;
}

function updateDot(
  dot: Dot,
  mouseX: number,
  mouseY: number,
  isActive: boolean,
  isMouseDown: boolean,
  defaultColor: string,
  accentColor: string,
  label: string
) {
  // dist threshol
  const distMax = 0.2;
  const distMin = 0.05;

  const mouseDistX = dot.x - mouseX;
  const mouseDistY = dot.y - mouseY;
  const distSq = Math.pow(mouseDistX, 2) + Math.pow(mouseDistY, 2);

  const distFactor = distSq / 100000;

  if (!isActive) {
    dot.linkElm.style.opacity = `${0}`;

    dot.elm.style.transition = `opacity 0.1s linear ${
      (1 - distFactor) * 0.12
    }s`;
    dot.elm.style.opacity = `${0}`;

    return;
  }

  // connect to the half way point between mouse and dot

  const MAX_CHARACTERS = 10;
  const textWidthFactor = map(label.length, 0, MAX_CHARACTERS, 0.8, 0.4);

  const isTooClose = distFactor < distMin + textWidthFactor * 0.02;
  const isTooFar = distFactor > distMax;
  const isConnected = !isTooClose && !isTooFar;

  if (isConnected) {
    const dotOffsetPosX = -mouseDistX * 0.035;
    const dotOffsetPosY = -mouseDistY * 0.035;

    const dx = mouseX - dot.x;
    const dy = mouseY - dot.y;
    const midX = dot.x + textWidthFactor * dx;
    const midY = dot.y + 0.7 * dy;

    dot.linkElm.setAttributeNS(null, "x1", `${dot.x + dotOffsetPosX}`);
    dot.linkElm.setAttributeNS(null, "y2", `${dot.y + dotOffsetPosY}`);
    dot.linkElm.setAttributeNS(null, "x2", `${midX}`);
    dot.linkElm.setAttributeNS(null, "y2", `${midY}`);

    dot.elm.style.transition = `
      opacity 0.1s linear,
      transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0s
    `;

    dot.elm.style.opacity = "1";
    dot.linkElm.style.opacity = `1`;

    // pulling effect
    dot.elm.style.transform = `translate(${dotOffsetPosX}px, ${dotOffsetPosY}px)`;

    // highlight colour
    dot.linkElm.style.stroke = accentColor;
    dot.elm.style.stroke = accentColor;
    dot.elm.style.fill = accentColor;

    return;
  }

  dot.linkElm.style.opacity = `${0}`;
  dot.linkElm.style.stroke = defaultColor;
  dot.elm.style.stroke = defaultColor;
  dot.elm.style.strokeWidth = "2.5";
  dot.elm.style.fill = "transparent";

  // staggering transition on hover
  dot.elm.style.transition = `
    opacity 0.1s linear ${distFactor * 0.1}s,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) ${distFactor * 0.1}s
  `;

  // the pulling effect
  dot.elm.style.transform = `${
    isMouseDown
      ? `translate(${-mouseDistX * 0.02}px, ${-mouseDistY * 0.02}px)`
      : "translate(0px, 0px)"
  }`;
  dot.elm.style.opacity = `${isMouseDown ? distFactor * 0.2 : distFactor * 10}`;
}
