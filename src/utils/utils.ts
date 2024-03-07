export function generateRandomFromRange(min = 0, max = 100) {
  // find diff
  let difference = max - min;

  // generate random number
  let rand = Math.random();

  // multiply with difference
  rand = rand * difference;

  // add with min value
  rand = rand + min;

  return rand;
}

export function getPositionFromAngleRadius(radius: number, angle: number) {
  var x = radius * Math.sin((Math.PI * 2 * angle) / 360);
  var y = radius * Math.cos((Math.PI * 2 * angle) / 360);
  return { x, y };
}

export function getRandomPosition(minRad: number, maxRad: number) {
  const angle = generateRandomFromRange(0, 360);
  const radius = generateRandomFromRange(minRad, maxRad);

  return getPositionFromAngleRadius(radius, angle);
}

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const progressOfRange = (value: number, min: number, max: number) => {
  return (value - min) / (max - min);
};
export const map = (
  value: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

export const colorMap = (progress: number, c1 = [0, 0, 0], c2 = [0, 0, 0]) => {
  return [
    map(progress, 0, 1, c1[0], c2[0]),
    map(progress, 0, 1, c1[1], c2[1]),
    map(progress, 0, 1, c1[2], c2[2]),
  ];
};

export const cssBezierString = ([ax, ay, bx, by]) =>
  `cubic-bezier(${ax}, ${ay}, ${bx}, ${by})`;

export const reverseBezier = (curve) => [
  1 - curve[2],
  1 - curve[3],
  1 - curve[0],
  1 - curve[1],
];
