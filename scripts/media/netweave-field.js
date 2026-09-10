export function createNetWeaveFrame(seed = 1, count = 12) {
  let state = seed >>> 0;
  const next = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 2 ** 32; };
  return Array.from({ length: count }, (_, index) => ({ id: index, x: Math.round(next() * 100), y: Math.round(next() * 100), congestion: Math.round(next() * 3) }));
}

export function renderNetWeaveField(documentRef = document, { controller, states } = {}) {
  const descriptions = states?.map((entry) => entry.description) ?? ['Three following vehicles have open gaps before the stationary lead vehicle.', 'The following vehicles advance one cell; the lead vehicle stays fixed.', 'The amber vehicle approaches the lead vehicle. No vehicle changes lane or route.'];
  const summary = documentRef.createElement('p');
  summary.className = 'netweave-field__summary';
  summary.textContent = 'Illustrative local-spacing study. Original explanatory artwork, not recorded NetWeave output. The amber block is a following vehicle; the rightmost blue block stays stationary. Congestion-aware rerouting remained future work.';
  const field = documentRef.createElement('div');
  field.className = 'netweave-specimen';
  const picture = documentRef.createElement('picture');
  const source = documentRef.createElement('source');
  source.media = '(max-width: 600px)';
  source.srcset = '/public/projects/netweave/mobile-01.webp';
  const image = documentRef.createElement('img');
  image.src = '/public/projects/netweave/desktop-01.webp';
  image.alt = 'Four vehicle blocks on a gridded lane; three approach a stationary lead vehicle.';
  image.width = 1600;
  image.height = 1100;
  image.loading = 'lazy';
  image.style.width = '100%';
  image.style.height = 'auto';
  picture.append(source, image);
  const stateText = documentRef.createElement('p');
  stateText.setAttribute('aria-live', 'polite');
  stateText.textContent = descriptions[0];
  const controls = documentRef.createElement('div');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Illustrative traffic states');
  const buttons = descriptions.map((description, index) => {
    const button = documentRef.createElement('button');
    button.type = 'button';
    button.textContent = states?.[index].label ?? ['Open gaps', 'Gaps narrow', 'Approach'][index];
    button.setAttribute('aria-pressed', String(index === 0));
    button.style.minHeight = '44px';
    button.style.marginRight = '.5rem';
    button.addEventListener('click', () => controller ? controller.selectState(index) : select(index));
    return button;
  });
  const select = (index) => {
    source.srcset = states?.[index].mobileImage ?? `/public/projects/netweave/mobile-0${index + 1}.webp`;
    image.src = states?.[index].image ?? `/public/projects/netweave/desktop-0${index + 1}.webp`;
    stateText.textContent = descriptions[index];
    buttons.forEach((entry, selected) => entry.setAttribute('aria-pressed', String(selected === index)));
  };
  if (controller) {
    controller.subscribe(({ state }) => select(state));
    select(controller.get().state);
  }
  image.addEventListener('error', () => { stateText.textContent = 'Artwork unavailable. ' + descriptions.join(' '); });
  controls.append(...buttons);
  field.append(picture, controls, stateText);
  const figure = documentRef.createElement('figure');
  figure.className = 'netweave-field-figure';
  figure.append(field, summary);
  return figure;
}
