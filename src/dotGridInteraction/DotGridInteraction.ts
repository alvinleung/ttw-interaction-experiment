import { iterateGrid, Grid, createGrid, GridItem } from "./grid";

export function createDotGridInteraction(
  baseElm: HTMLElement,
  width: number,
  height: number
) {
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns, "svg");
  svg.setAttributeNS(null, "width", width.toString());
  svg.setAttributeNS(null, "height", height.toString());
  // svg.setAttributeNS(null, "viewBox", `0 0 ${width + 8} ${height + 8}`);

  svg.style.position = "absolute";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.top = "0px";
  svg.style.left = "0px";

  baseElm.appendChild(svg);

  const dotGrid = createDotGrid(svg, width, height);

  const beginInteraction = () => {};
  const pauseInteraction = () => {};

  return {
    beginInteraction,
    pauseInteraction,
  };
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
  dotSize = 8
) {
  const cols = Math.floor(width / interval);
  const rows = Math.floor(height / interval);

  const dotElmColInterval = Math.round((width - dotSize) / (cols - 1));
  const dotElmRowInterval = Math.round((height - dotSize) / (rows - 1));

  const grid = createGrid<Dot>(cols, rows, ({ col, row }) => {
    const x = col * dotElmColInterval;
    const y = row * dotElmRowInterval;
    const dotElm = createDotElm(x, y, dotSize, "#FFF");
    const dotLink = createDotLink(x, y, "#FFF");

    svg.appendChild(dotElm);
    svg.appendChild(dotLink);

    return { size: dotSize, col, row, elm: dotElm, linkElm: dotLink, x, y };
  });

  const textLabel = createLabel("Hello");
  svg.appendChild(textLabel);

  const elmBounds = svg.getBoundingClientRect();
  const handleMouseMove = (e: MouseEvent) => {
    // mouse move here
    const offsetX = e.clientX - elmBounds.x;
    const offsetY = e.clientY - elmBounds.y;

    textLabel.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    // textLabel.style.opacity = `0.4`;

    grid.items.forEach((dot) => updateDot(dot, offsetX, offsetY));
  };
  svg.addEventListener("mousemove", handleMouseMove);

  // renderDotGrid(grid);
  return {
    grid,
  };
}

function createDotElm(x: number, y: number, size: number, color: string) {
  const svgns = "http://www.w3.org/2000/svg";
  const dotElm = document.createElementNS(svgns, "rect") as SVGRectElement;

  dotElm.setAttributeNS(null, "width", `${size}`);
  dotElm.setAttributeNS(null, "height", `${size}`);
  dotElm.setAttributeNS(null, "x", `${x}`);
  dotElm.setAttributeNS(null, "y", `${y}`);
  dotElm.setAttributeNS(null, "fill", `${color}`);

  dotElm.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";

  return dotElm;
}

function createLabel(text: string) {
  const svgns = "http://www.w3.org/2000/svg";
  const textElm = document.createElementNS(svgns, "text") as SVGTextElement;

  textElm.setAttributeNS(null, "x", `${0}`);
  textElm.setAttributeNS(null, "y", `${0}`);
  textElm.setAttributeNS(null, "fill", `#FFF`);
  textElm.setAttributeNS(null, "font-size", `16px`);

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

  dotLink.style.strokeWidth = "2";
  dotLink.style.strokeDasharray = "500";
  // dotLink.style.transition = `all 0.3s cubic-bezier(0.87, 0, 0.13, 1)`;

  return dotLink;
}

function updateDot(dot: Dot, mouseX: number, mouseY: number) {
  // dist threshol
  const distMax = 0.2;
  const distMin = 0.05;

  const mouseDistX = dot.x - mouseX;
  const mouseDistY = dot.y - mouseY;
  const distSq = Math.pow(mouseDistX, 2) + Math.pow(mouseDistY, 2);
  const distFactor = distSq / 100000;

  dot.elm.style.opacity = `${distFactor * 10}`;

  // connect to the half way point between mouse and dot
  dot.linkElm.setAttributeNS(null, "x2", `${(dot.x + mouseX) * 0.5}`);
  dot.linkElm.setAttributeNS(null, "y2", `${(dot.y + mouseY) * 0.5}`);

  const isConnected = distFactor < distMax && distFactor > distMin;
  if (isConnected) {
    // dot.linkElm.style.opacity = `${1}`;
    dot.linkElm.style.strokeDashoffset = "000";

    // pulling effect
    dot.elm.style.transform = `translate(${-mouseDistX * 0.035}px, ${
      -mouseDistY * 0.035
    }px)`;

    // highlight colour
    dot.linkElm.style.stroke = "#0F0";
    dot.elm.style.fill = "#0F0";

    return;
  }
  // dot.linkElm.style.opacity = `${0}`;
  dot.linkElm.style.strokeDashoffset = "500";
  dot.linkElm.style.stroke = "#888";
  dot.elm.style.fill = "#FFF";

  // the pulling effect
  dot.elm.style.transform = `translate(0px, 0px)`;
}
