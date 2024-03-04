import { clamp } from "./utils";

interface ScrollRangeHandler {
  begin: number;
  end: number;
  callback: ({
    progress,
    offset,
  }: {
    progress: number;
    offset: number;
  }) => void;
}

export const createScrollInteractionProvider = () => {
  const rangeHandlers: ScrollRangeHandler[] = [];

  const handleScroll = () => {
    const scrollPos = window.scrollY;
    rangeHandlers.forEach((handler) => {
      const scrollOffset = scrollPos - handler.begin;
      const scrollProgress = scrollOffset / (handler.end - handler.begin);
      handler.callback({
        offset: scrollOffset,
        progress: clamp(scrollProgress, 0, 1),
      });
    });
  };

  const observe = (
    begin: number,
    end: number,
    callback: ({
      progress,
      offset,
    }: {
      progress: number;
      offset: number;
    }) => void = ({ progress, offset }) => {}
  ) => {
    const handler: ScrollRangeHandler = {
      begin,
      end,
      callback,
    };
    rangeHandlers.push(handler);
    return () => {
      // cleanup range
      const removeIndex = rangeHandlers.findIndex((item) => item === handler);
      rangeHandlers.splice(removeIndex, 1);
    };
  };

  window.addEventListener("scroll", handleScroll);

  const cleanup = () => {
    window.removeEventListener("scroll", handleScroll);
  };

  return {
    observe,
    cleanup,
  };
};
