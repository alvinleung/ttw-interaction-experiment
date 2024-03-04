type StateChangeHandler<T> = (latest: T) => void;
type StateChangeCleanup = () => void;
type State<T> = {
  set: (value: T) => void;
  get: () => T;
  onChange: (handler: StateChangeHandler<T>) => StateChangeCleanup;
};

export function state<T>(initial: T): State<T> {
  const listeners: Array<StateChangeHandler<T>> = [];
  let curr = initial;
  const set = (value: T) => {
    if (value === curr) return;
    curr = value;
    listeners.forEach((handler: StateChangeHandler<T>) => {
      handler(value);
    });
  };
  const get = () => curr;
  const onChange = (handler: StateChangeHandler<T>) => {
    listeners.push(handler);
    return () => {
      listeners.splice(listeners.indexOf(handler), 1);
    };
  };

  return {
    set,
    get,
    onChange,
  };
}

// usage
/**

const state1: State<number> = ...;
const state2: State<string> = ...;
const state3: State<boolean> = ...;

const cleanup = onChangeAny(state1, state2, state3)((num, str, bool) => {
  // Here, `num` will be of type `number`, `str` of type `string`, and `bool` of type `boolean`.
  // These types correspond to the order of states provided in the function call.
});

*/

export function onChangeAny<T extends any[]>(
  ...states: { [K in keyof T]: State<T[K]> }
) {
  return (handler: (...args: T) => void) => {
    const handleStateChange = () => {
      handler(...(states.map((state) => state.get()) as T));
    };

    const cleanups = states.map((state) => {
      return state.onChange(() => {
        handleStateChange();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  };
}
