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

const countdown = document.querySelector('.hero-countdown');

if (countdown) {
  const countdownParts = {
    days: document.querySelector('#countdown-days'),
    hours: document.querySelector('#countdown-hours'),
    minutes: document.querySelector('#countdown-minutes'),
    seconds: document.querySelector('#countdown-seconds')
  };
  const countdownLabel = document.querySelector('#countdown-label');
  const updateCountdown = () => {
    const mesaDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Phoenix', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date()).reduce((date, part) => {
      if (part.type !== 'literal') date[part.type] = Number(part.value);
      return date;
    }, {});
    const today = Date.UTC(mesaDate.year, mesaDate.month - 1, mesaDate.day);
    const mesaNow = Date.UTC(mesaDate.year, mesaDate.month - 1, mesaDate.day, mesaDate.hour, mesaDate.minute, mesaDate.second);
    const openingNight = Date.UTC(2026, 9, 30, 19);
    const finalNight = Date.UTC(2026, 9, 31);
    const secondsLeft = Math.max(0, Math.ceil((openingNight - mesaNow) / 1000));

    if (today > finalNight) {
      Object.values(countdownParts).forEach((part) => { part.textContent = '00'; });
      countdownLabel.textContent = 'THE 2026 DATES HAVE PASSED';
    } else if (today === finalNight) {
      Object.values(countdownParts).forEach((part) => { part.textContent = '00'; });
      countdownLabel.textContent = 'FINAL NIGHT — OCTOBER 31';
    } else if (today === Date.UTC(2026, 9, 30) && mesaNow >= openingNight) {
      Object.values(countdownParts).forEach((part) => { part.textContent = '00'; });
      countdownLabel.textContent = 'OCTOBER 30 — OPENING NIGHT';
    } else {
      const days = Math.floor(secondsLeft / 86400);
      const hours = Math.floor((secondsLeft % 86400) / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      countdownParts.days.textContent = String(days).padStart(2, '0');
      countdownParts.hours.textContent = String(hours).padStart(2, '0');
      countdownParts.minutes.textContent = String(minutes).padStart(2, '0');
      countdownParts.seconds.textContent = String(seconds).padStart(2, '0');
      countdownLabel.textContent = 'UNTIL OPENING NIGHT';
    }
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

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
