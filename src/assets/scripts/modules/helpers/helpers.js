export const eases = {
  ex: 'expo.inOut',
  exI: 'expo.in',
  exO: 'expo.out',
  p4: 'power4.inOut',
  p4I: 'power4.in',
  p4O: 'power4.out',
  p2: 'power2.inOut',
  p2I: 'power2.in',
  p2O: 'power2.out',
  circ: 'circ.inOut',
  circO: 'circ.out',
  circI: 'circ.in',
};

export const langDetect = () => {
  const lang = document.documentElement.getAttribute('lang') || 'en';
  if (lang === 'ua') return 'uk';
  return lang;
};


export function useState(initialValue) {
  let value = initialValue;
  const subscribers = [];

  function setValue(newValue) {
    value = newValue;
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function getState() {
    return value;
  }

  function subscribe(callback) {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  return [getState, setValue, subscribe];
}


export function pad(value) {
  if (value < 10) return `0${value}`;
  return value;
}


// debounced resize handler
export function debounceResize(callback, delay = 100) {
  let timeoutId;

  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback();
    }, delay);
  };
}


export function createResponsiveTimeline({
  createTimelineFn,
  debounceDelay = 300
}) {
  let resizeTimeout;
  let timeline = null;

  function updateTimeline() {
    if (Array.isArray(timeline)) {
      timeline.forEach(tl => {
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill(true);
        }
        tl.kill(true);
      });
      timeline = createTimelineFn();
      return;
    }
    if (isObject(timeline)) {
      timeline.scrollTrigger.kill(true);
      timeline.kill(true);
      timeline = null;
    }
    timeline = createTimelineFn();
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateTimeline, debounceDelay);
  });

  updateTimeline();

  return () => {
    if (Array.isArray(timeline)) {
      timeline.forEach(tl => {
        if (tl.scrollTrigger) {
          tl.scrollTrigger.kill(true);
        }
        tl.kill(true);
      });
      clearTimeout(resizeTimeout);
      return;
    }
    if (isObject(timeline)) {
      timeline.scrollTrigger.kill(true);
      timeline.kill(true);
    }
    clearTimeout(resizeTimeout);
  };
}