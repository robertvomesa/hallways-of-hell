const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('open');
    });
  });
}

const signupDialog = document.querySelector('#signup-dialog');
if (signupDialog) {
  document.querySelectorAll('[data-open-signup]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (typeof signupDialog.showModal !== 'function') return;
      event.preventDefault();
      signupDialog.showModal();
      signupDialog.querySelector('[data-close-signup]')?.focus();
    });
  });

  signupDialog.querySelector('[data-close-signup]')?.addEventListener('click', () => signupDialog.close());
  signupDialog.addEventListener('click', (event) => {
    if (event.target === signupDialog) signupDialog.close();
  });
}

// Tracking stays dormant until a GA4 tag is configured. Never pass form values or other PII.
const track = (eventName) => {
  if (typeof window.gtag === 'function') window.gtag('event', eventName);
};

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-analytics]');
  if (!target) return;
  const eventName = target.dataset.analytics;
  if (['ticket_click', 'social_click'].includes(eventName)) track(eventName);
});

if (document.body.dataset.page === 'event-details') track('event_details_view');

const gallerySection = document.querySelector('[data-analytics-view="gallery_view"]');
if (gallerySection && 'IntersectionObserver' in window) {
  const galleryObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      track('gallery_view');
      galleryObserver.disconnect();
    }
  }, { threshold: 0.35 });
  galleryObserver.observe(gallerySection);
}

// The future form integration should call this only after successful provider confirmation.
// Accepted values are channel names only; email addresses and phone numbers are never included.
window.hohSignupSucceeded = (channels) => {
  if (!Array.isArray(channels)) return;
  if (channels.includes('email')) track('email_signup');
  if (channels.includes('sms')) track('sms_signup');
};

const galleryTrack = document.querySelector('#gallery-track');
const galleryCurrent = document.querySelector('#gallery-current');

if (galleryTrack && galleryCurrent) {
  const slides = [...galleryTrack.querySelectorAll('.gallery-slide')];
  let updateQueued = false;

  const updateGalleryCounter = () => {
    const trackCenter = galleryTrack.getBoundingClientRect().left + galleryTrack.clientWidth / 2;
    const activeIndex = slides.reduce((nearestIndex, slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      const nearest = slides[nearestIndex].getBoundingClientRect();
      return distance < Math.abs(nearest.left + nearest.width / 2 - trackCenter) ? index : nearestIndex;
    }, 0);
    galleryCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
    updateQueued = false;
  };

  galleryTrack.addEventListener('scroll', () => {
    if (!updateQueued) {
      updateQueued = true;
      requestAnimationFrame(updateGalleryCounter);
    }
  }, { passive: true });

  document.querySelectorAll('[data-gallery-direction]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.galleryDirection === 'next' ? 1 : -1;
      galleryTrack.scrollBy({ left: direction * galleryTrack.clientWidth * 0.78, behavior: 'smooth' });
    });
  });

  galleryTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      galleryTrack.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * galleryTrack.clientWidth * 0.78, behavior: 'smooth' });
    }
  });

  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragged = false;

  galleryTrack.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartScroll = galleryTrack.scrollLeft;
    dragged = false;
    galleryTrack.setPointerCapture(event.pointerId);
    galleryTrack.classList.add('is-dragging');
  });

  galleryTrack.addEventListener('pointermove', (event) => {
    if (!galleryTrack.hasPointerCapture(event.pointerId)) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) dragged = true;
    if (dragged) {
      event.preventDefault();
      galleryTrack.scrollLeft = dragStartScroll - distance;
    }
  });

  const endGalleryDrag = (event) => {
    if (galleryTrack.hasPointerCapture(event.pointerId)) galleryTrack.releasePointerCapture(event.pointerId);
    galleryTrack.classList.remove('is-dragging');
  };

  galleryTrack.addEventListener('pointerup', endGalleryDrag);
  galleryTrack.addEventListener('pointercancel', endGalleryDrag);
  updateGalleryCounter();
}
