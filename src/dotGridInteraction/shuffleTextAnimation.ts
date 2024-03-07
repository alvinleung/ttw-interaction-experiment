export function triggerShuffleAnimation(textElm: SVGTextElement, text: string) {
  const originalParent = textElm.parentElement;

  if (!originalParent) {
    console.error("Parent element of <text> element not found.");
    return () => {};
  }

  const originalIndex = Array.from(originalParent.children).indexOf(textElm);

  let shuffleInterval = setInterval(() => {
    console.log("shulffle");
    shuffleSvgText(textElm);
  }, 1000 / 24); // Shuffle every 2 seconds

  const stopAnimation = () => {
    // Return the text element to its original position and content
    const currentParent = textElm.parentElement;
    if (currentParent) {
      const currentIndex = Array.from(currentParent.children).indexOf(textElm);
      if (currentIndex !== originalIndex) {
        originalParent.appendChild(textElm);
      }
    }
    textElm.textContent = text;
    clearInterval(shuffleInterval);
  };

  let timeout = setTimeout(stopAnimation, 400); // Restore every .5 seconds

  // restoreAnimation();

  return () => {
    stopAnimation();
    clearTimeout(timeout);
  };
}

function shuffleSvgText(textElement: SVGTextElement): void {
  const parentElement = textElement.parentElement;

  if (!parentElement) {
    console.error("Parent element of <text> element not found.");
    return;
  }
  textElement.innerHTML = shuffleString(textElement.innerHTML);
}

function shuffleString(str: string): string {
  // Convert the string to an array of characters
  let charArray: string[] = str.split("");

  // Loop through the array and shuffle the characters
  for (let i: number = charArray.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]]; // Swap characters
  }

  // Convert the shuffled array back to a string and return
  return charArray.join("");
}
