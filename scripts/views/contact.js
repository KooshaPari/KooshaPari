/* ================================================================
   Contact view — animated form with floating labels, validation,
   magnetic submit, and contact info with scroll-reveal.

   Uses the el() DOM helper from components/dom.js and the
   .magnetic class for the magnetic.js spring-physics system.
   ================================================================ */

import { el } from '../components/dom.js';
import { ICONS, ERROR_MESSAGES, validateField } from './contact-helpers.js';

/* ------------------------------------------------------------------
   Build a single form field
   ------------------------------------------------------------------ */
function buildField({ name, label, type = 'text', required = true, tag = 'input' }) {
  const isTextarea = tag === 'textarea';
  const inputClass = isTextarea ? 'contact-form__textarea' : 'contact-form__input';
  const inputAttrs = {
    class: inputClass,
    id: `contact-${name}`,
    name,
    placeholder: ' ',
    'data-field': name,
  };
  if (required) inputAttrs.required = '';
  if (type !== 'text') inputAttrs.type = type;

  const input = isTextarea
    ? el('textarea', { ...inputAttrs, rows: 5 })
    : el('input', inputAttrs);

  return el('div', { class: 'contact-form__field', 'data-field': name },
    input,
    el('label', { class: 'contact-form__label', for: `contact-${name}` }, label),
    el('span', { class: 'contact-form__underline' }),
    el('span', { class: 'contact-form__checkmark', html: ICONS.check }),
    el('span', { class: 'contact-form__error' }, ERROR_MESSAGES[name]),
    isTextarea
      ? el('span', { class: 'contact-form__char-count', 'data-counter': name })
      : null,
  );
}

/* ------------------------------------------------------------------
   Initialise form event listeners (floating labels, validation)
   ------------------------------------------------------------------ */
function initFormEvents(form) {
  const fields = form.querySelectorAll('[data-field]');

  for (const field of fields) {
    const input = field.querySelector('.contact-form__input, .contact-form__textarea');
    if (!input) continue;

    const fieldName = field.dataset.field;
    const counter = field.querySelector('[data-counter]');

    input.addEventListener('input', () => {
      // Update character count for textarea
      if (counter) {
        counter.textContent = `${input.value.length} / 500`;
      }

      // Validate on input after first blur
      if (field.classList.contains('field--invalid') || field.classList.contains('field--valid')) {
        applyFieldValidation(fieldName, input.value, field);
      }
    });

    input.addEventListener('blur', () => {
      if (input.value.trim().length > 0) {
        applyFieldValidation(fieldName, input.value, field);
      } else {
        clearValidation(field);
      }
    });

    input.addEventListener('focus', () => {
      // Clear error on focus for fresh interaction
      if (field.classList.contains('field--invalid')) {
        clearValidation(field);
      }
    });
  }
}

/* ------------------------------------------------------------------
   Validate a single field
   ------------------------------------------------------------------ */
function applyFieldValidation(name, value, fieldEl) {
  const status = validateField(name, value);
  const isValid = status === 'valid';
  fieldEl.classList.toggle('field--valid', isValid);
  fieldEl.classList.toggle('field--invalid', status === 'invalid');
}

/* ------------------------------------------------------------------
   Clear validation state
   ------------------------------------------------------------------ */
function clearValidation(fieldEl) {
  fieldEl.classList.remove('field--valid', 'field--invalid');
}

/* ------------------------------------------------------------------
   Validate all fields, return true if all valid
   ------------------------------------------------------------------ */
function validateAll(form) {
  let allValid = true;
  const fields = form.querySelectorAll('[data-field]');

  for (const field of fields) {
    const input = field.querySelector('.contact-form__input, .contact-form__textarea');
    if (!input) continue;

    const fieldName = field.dataset.field;
    const isValid = VALIDATORS[fieldName](input.value);
    field.classList.toggle('field--valid', isValid);
    field.classList.toggle('field--invalid', !isValid);
    if (!isValid) allValid = false;
  }

  return allValid;
}

/* ------------------------------------------------------------------
   Submit handler with loading/success states
   ------------------------------------------------------------------ */
function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = form.querySelector('.contact-form__submit');
  if (!button || button.classList.contains('is-loading')) return;

  if (!validateAll(form)) return;

  // Loading state
  button.classList.add('is-loading');
  button.disabled = true;

  // Simulate async submission (replace with real endpoint)
  setTimeout(() => {
    button.classList.remove('is-loading');
    button.classList.add('is-success');

    // Reset after showing success
    setTimeout(() => {
      form.reset();
      button.classList.remove('is-success');
      button.disabled = false;

      // Clear all field validation states
      const fields = form.querySelectorAll('[data-field]');
      for (const field of fields) {
        clearValidation(field);
        const counter = field.querySelector('[data-counter]');
        if (counter) counter.textContent = '';
      }
    }, 2000);
  }, 1200);
}

/* ------------------------------------------------------------------
   Render — returns nothing; appends into root via replaceChildren().
   Follows the renderContact(root) contract used by the router.
   ------------------------------------------------------------------ */
export function renderContact(root) {
  const form = el('form', {
    class: 'contact-form',
    role: 'form',
    'aria-label': 'Contact form',
    novalidate: '',
  },
    buildField({ name: 'name', label: 'Name', type: 'text' }),
    buildField({ name: 'email', label: 'Email', type: 'email' }),
    buildField({ name: 'subject', label: 'Subject', type: 'text' }),
    buildField({ name: 'message', label: 'Message', tag: 'textarea' }),
    el('button', {
      class: 'contact-form__submit magnetic',
      type: 'submit',
    },
      el('span', { class: 'contact-form__submit-label' }, 'Send Message'),
      el('span', { class: 'contact-form__spinner' }),
      el('span', { class: 'contact-form__checkmark-icon', html: ICONS.check }),
    ),
  );

  form.addEventListener('submit', handleSubmit);
  initFormEvents(form);

  root.replaceChildren(
    el('section', { class: 'view active portfolio-view' },
      el('p', { class: 'eyebrow', 'data-reveal': 'up' }, 'CONTACT'),
      el('h1', { 'data-reveal': 'up', 'data-reveal-delay': '60' },
        'Let\u2019s build something.',
      ),
      el('p', {
        class: 'lede',
        'data-reveal': 'up',
        'data-reveal-delay': '120',
      }, 'For engineering, technical product, and infrastructure conversations:'),

      el('div', { class: 'contact-layout', 'data-reveal': 'up', 'data-reveal-delay': '180' },
        form,

        el('div', { class: 'contact-info' },
          el('h2', { class: 'contact-info__heading' }, 'Get in touch'),

          el('div', { class: 'contact-info__links' },
            // Email
            el('a', {
              class: 'contact-info__link',
              href: 'mailto:koosha@kooshapari.com',
              'aria-label': 'Email Koosha Paridehpour',
              'data-reveal': 'up',
              'data-reveal-delay': '240',
            },
              el('span', { class: 'contact-info__link-icon', html: ICONS.email }),
              el('span', { class: 'contact-info__link-text' },
                el('span', { class: 'contact-info__link-label' }, 'Email'),
                el('span', { class: 'contact-info__link-value' }, 'koosha@kooshapari.com'),
              ),
            ),
            // GitHub
            el('a', {
              class: 'contact-info__link',
              href: 'https://github.com/KooshaPari',
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': 'Koosha Paridehpour on GitHub',
              'data-reveal': 'up',
              'data-reveal-delay': '300',
            },
              el('span', { class: 'contact-info__link-icon', html: ICONS.github }),
              el('span', { class: 'contact-info__link-text' },
                el('span', { class: 'contact-info__link-label' }, 'GitHub'),
                el('span', { class: 'contact-info__link-value' }, 'KooshaPari'),
              ),
            ),
            // LinkedIn
            el('a', {
              class: 'contact-info__link',
              href: 'https://www.linkedin.com/in/koosha-paridehpour-1079b61b5/',
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': 'Koosha Paridehpour on LinkedIn',
              'data-reveal': 'up',
              'data-reveal-delay': '360',
            },
              el('span', { class: 'contact-info__link-icon', html: ICONS.linkedin }),
              el('span', { class: 'contact-info__link-text' },
                el('span', { class: 'contact-info__link-label' }, 'LinkedIn'),
                el('span', { class: 'contact-info__link-value' }, 'Koosha Paridehpour'),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
