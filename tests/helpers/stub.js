const stubs = [];

export const stub = (target, method, implementation) => {
  const original = target[method];
  target[method] = implementation;
  stubs.push(() => {
    target[method] = original;
  });
};

export const restoreStubs = () => {
  while (stubs.length) stubs.pop()();
};
