const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

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
    if (dragged) galleryTrack.scrollTo({ left: galleryTrack.scrollLeft, behavior: 'smooth' });
  };

  galleryTrack.addEventListener('pointerup', endGalleryDrag);
  galleryTrack.addEventListener('pointercancel', endGalleryDrag);
  updateGalleryCounter();
}
