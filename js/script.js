const endpoint = "https://script.google.com/macros/s/AKfycbwfTEuk3ChkW5asDRdgTgL1U2V3dxVTMUa_j83zlyzpIkbWun9GVWWa-u3AYzqelEQ/exec";


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Якорі..........................................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
    
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId); 
    
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50, 
                    behavior: 'smooth' 
                });
            }
        });
    });


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Отримуємо дані з таблиці...............................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.getElementById("carousel");
  
  carousel.classList.add("loading"); // показати смугу

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    data.reverse();

    data.forEach(card => {
      const cardEl = document.createElement("div");
      cardEl.className = "pet-carousel__card";

      const button = document.createElement("button");
      button.className = "openPopup info-btn";
      button.setAttribute("aria-label", "Інформація");
      button.textContent = "+";

      const fields = [
        "Ім'я",
        "Фото",
        "Вік",
        "Розмір",
        "Місто",
        "Чекає господаря",
        "Телефон"
      ];

      fields.forEach(field => {
        const attrName = "data-" + field.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "");
        button.setAttribute(attrName, card[field] || "");
      });

      const img = document.createElement("img");
      img.src = card["Фото"];
      img.alt = card["Ім'я"] || "Тваринка";
      img.loading = "lazy";

      cardEl.appendChild(button);
      cardEl.appendChild(img);
      carousel.appendChild(cardEl);
    });
  } catch (error) {
    console.error("Помилка при завантаженні карток:", error);
  } finally {
    carousel.classList.remove("loading"); // приховати смугу
  }
});

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ПОПАП ......................................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const popupOverlay = document.getElementById("popupOverlay");
const closePopupBtn = document.querySelector(".closePopup");
let lastClickedButton = null;

function initPopupButtons() {
  const openPopupBtns = document.querySelectorAll(".openPopup");

  if (openPopupBtns.length === 0) {
    setTimeout(initPopupButtons, 100);
    return;
  }

  openPopupBtns.forEach(button => {
    button.addEventListener("click", function () {
      lastClickedButton = button;

      // Перевірка наявності всіх необхідних data-атрибутів
      const requiredAttributes = ["імя", "вік", "розмір", "місто", "фото", "чекає-господаря", "телефон"];
      const missingAttr = requiredAttributes.filter(attr => !button.dataset[attr]);

      if (missingAttr.length > 0) {
        console.warn("Відсутні data-атрибути:", missingAttr);
        return;
      }

      // Вставлення текстових даних
      document.getElementById("popupName").textContent = button.dataset.імя;
      document.getElementById("popupAge").textContent = button.dataset.вік;
      document.getElementById("popupSize").textContent = button.dataset.розмір;
      document.getElementById("popupCity").textContent = button.dataset.місто;
      document.getElementById("popupPhone").textContent = button.dataset.телефон;
      document.getElementById("popupPhone").href = `tel:${button.dataset.телефон.replace(/\s+/g, '')}`;
      document.getElementById("popupWaits").textContent = button.getAttribute("data-чекає-господаря");

      // Завантаження зображення
      const popupImgContainer = document.querySelector(".popup__img");
      const imgSrc = button.dataset.фото;
      const img = new Image();
      img.classList.add("popup-clone-img");
      img.alt = button.dataset.імя || "Фото тваринки";
      img.src = imgSrc;

      img.onload = () => {
        popupImgContainer.innerHTML = "";
        popupImgContainer.appendChild(img);
        openPopup(button); // відкриваємо тільки після завантаження
      };

      img.onerror = () => {
        console.warn("Зображення не завантажено:", imgSrc);
      };
    });
  });
}

function openPopup(button) {
  lastClickedButton = button;
  
  // Отримуємо координати кнопки одразу
  const buttonRect = button.getBoundingClientRect();
  const popupWidth = popupOverlay.offsetWidth;
  const popupHeight = popupOverlay.offsetHeight;

  // Початкова позиція (центр кнопки)
  const startX = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;
  const startY = buttonRect.top + buttonRect.height / 2 - popupHeight / 2;
  
  // Кінцева позиція (центр екрана)
  const endX = window.innerWidth / 2 - popupWidth / 2;
  const endY = window.innerHeight / 2 - popupHeight / 2;

  // Встановлюємо початкову позицію без анімації
  popupOverlay.style.transition = 'none';
  popupOverlay.style.transform = `translate(${startX}px, ${startY}px) scale(0)`;
  popupOverlay.classList.add("show");
  
  // Використовуємо requestAnimationFrame для гарантії, що браузер відобразив початковий стан
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Тепер включаємо анімацію
      popupOverlay.style.transition = "transform 0.3s ease-out";
      popupOverlay.style.transform = `translate(${endX}px, ${endY}px) scale(1)`;
    });
  });

  document.body.classList.add('lock');
}

function closePopup() {
  if (!lastClickedButton) return;

    const buttonRect = lastClickedButton.getBoundingClientRect();

    popupOverlay.style.transform = `translate(${buttonRect.left + buttonRect.width / 2 - popupOverlay.offsetWidth / 2}px, ${buttonRect.top + buttonRect.height / 2 - popupOverlay.offsetHeight / 2}px) scale(0)`;

  setTimeout(() => {
    popupOverlay.classList.remove("show");
    document.body.classList.remove('lock');
    lastClickedButton = null;

    const popupImgContainer = document.querySelector(".popup__img");
    if (popupImgContainer) {
      popupImgContainer.innerHTML = "";
    }

    document.getElementById("popupName").textContent = "";
    document.getElementById("popupAge").textContent = "";
    document.getElementById("popupSize").textContent = "";
    document.getElementById("popupCity").textContent = "";
    document.getElementById("popupPhone").textContent = "";
    document.getElementById("popupWaits").textContent = "";
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  initPopupButtons();
});

popupOverlay.addEventListener("click", function (event) {
  if (event.target === popupOverlay) {
    closePopup();
  }
});

closePopupBtn.addEventListener("click", closePopup);

window.addEventListener('resize', () => {
  if (popupOverlay.classList.contains('show')) {
    closePopup();
  }
});
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// слайдер................................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const VISIBLE_SLIDES = 5;
const CENTER_INDEX = Math.floor(VISIBLE_SLIDES / 2);
const SWIPE_THRESHOLD = 50;
const IS_TOUCH_DEVICE = 'ontouchstart' in window;

let slideWidth = 0;
let isAnimating = false;
let currentIndex = 0;
let slides = [];
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let dragStartX = 0;
let dragOffset = 0;
let allowInteraction = true;
let touchStartY = 0;
let isHorizontalSwipe = null;
let lastInputType = null;

const slider = document.querySelector('.slider');
const slideBlock = document.querySelector('.slider-block');
const arrowNext = document.querySelector('.arrow-next');
const arrowPrev = document.querySelector('.arrow-prev');

// --- Встановлення висот для активного слайду ---
const setHeights = (targetSlide = null) => {
    const target = targetSlide || document.querySelector('.slide:not(.inactive)');
    if (!target) return;

    const slideTop = target.querySelector('.slide__top');
    const slideBottom = target.querySelector('.slide__bottom');
    const slideHeight = target.querySelector('.img__height')?.offsetHeight || 0;

    document.documentElement.style.setProperty('--slide-height', `${slideHeight}px`);
    document.documentElement.style.setProperty('--slide-top-height', `${slideTop?.offsetHeight || 0}px`);
    document.documentElement.style.setProperty('--slide-bottom-height', `${slideBottom?.offsetHeight || 0}px`);
};

// --- Застосування ширини слайдів ---
const applySlideSizes = () => {
    slideWidth = slider.clientWidth;
    if (slideWidth <= 0) return;
    slides.forEach(slide => slide.style.width = `${slideWidth}px`);
};

const getIndex = (i, total) => (i + total) % total;

// --- Відмальовування видимих слайдів ---
const renderSlides = () => {
    slideBlock.innerHTML = '';
    const total = slides.length;

    for (let i = 0; i < VISIBLE_SLIDES; i++) {
        const index = getIndex(currentIndex + i - CENTER_INDEX, total);
        const clone = slides[index].cloneNode(true);

        clone.classList.add('slide');
        clone.style.width = `${slideWidth}px`;
        clone.style.transition = 'transform 0.6s ease, opacity 0.6s ease';

        if (i === CENTER_INDEX) {
            clone.classList.remove('inactive');
            clone.style.transform = 'scale(1)';
            clone.style.opacity = '1';
            clone.style.zIndex = '2';
        } else {
            clone.classList.add('inactive');
            clone.style.transform = 'scale(0.95)';
            clone.style.opacity = '0.6';
            clone.style.zIndex = '1';
        }
        slideBlock.appendChild(clone);
    }

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
    setHeights(slideBlock.children[CENTER_INDEX]);
};

// --- Зміна слайда ---
const handleSlideChange = (direction) => {
    if (isAnimating || !allowInteraction) return;
    allowInteraction = false;
    isAnimating = true;

    const total = slides.length;
    const newIndex = direction === 'next'
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;

    const shift = direction === 'next' ? CENTER_INDEX + 1 : CENTER_INDEX - 1;

    const oldCenter = slideBlock.children[CENTER_INDEX];
    if (oldCenter) {
        oldCenter.style.transform = 'scale(0.95)';
        oldCenter.style.opacity = '0.6';
        oldCenter.style.zIndex = '1';
    }

    const futureCenter = slideBlock.children[shift];
    if (futureCenter) {
        futureCenter.classList.remove('inactive');
        futureCenter.style.transform = 'scale(1)';
        futureCenter.style.opacity = '1';
        futureCenter.style.zIndex = '2';
    }

    slideBlock.style.transition = 'transform 0.6s ease';
    slideBlock.style.transform = `translateX(-${shift * slideWidth}px)`;

    slideBlock.addEventListener('transitionend', () => {
        currentIndex = newIndex;
        renderSlides();
        isAnimating = false;
        allowInteraction = true;
    }, { once: true });
};

const nextSlide = () => handleSlideChange('next');
const prevSlide = () => handleSlideChange('prev');

// --- Touch-події ---
const handleTouchStart = (e) => {
    if (!allowInteraction) return;
    lastInputType = 'touch';
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX = touchStartX;
    isHorizontalSwipe = null;
};

const handleTouchMove = (e) => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (isHorizontalSwipe === null) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!isHorizontalSwipe) return; // вертикальний свайп — даємо сторінці скролитися

    e.preventDefault();
    touchEndX = e.touches[0].clientX;

    const diff = touchStartX - touchEndX;
    const offset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, diff));

    slideBlock.style.transition = 'none';
    slideBlock.style.transform = `translateX(${-CENTER_INDEX * slideWidth - offset}px)`;
};

const handleTouchEnd = () => {
    if (!allowInteraction || lastInputType !== 'touch' || !touchStartX) return;

    if (isHorizontalSwipe) {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            diff > 0 ? nextSlide() : prevSlide();
        } else {
            slideBlock.style.transition = 'transform 0.3s ease';
            slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
        }
    }

    touchStartX = touchEndX = 0;
    isHorizontalSwipe = null;
};

// --- Mouse-події ---
const handleMouseDown = (e) => {
    if (IS_TOUCH_DEVICE || !allowInteraction) return;
    lastInputType = 'mouse';
    isDragging = true;
    dragStartX = e.clientX;
    slideBlock.style.transition = 'none';
    e.preventDefault();
};

const handleMouseMove = (e) => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;

    dragOffset = e.clientX - dragStartX;
    dragOffset = Math.max(-slideWidth * 0.3, Math.min(slideWidth * 0.3, dragOffset));

    slideBlock.style.transform = `translateX(${-CENTER_INDEX * slideWidth + dragOffset}px)`;
};

const handleMouseUp = () => {
    if (!isDragging || IS_TOUCH_DEVICE || lastInputType !== 'mouse' || !allowInteraction) return;
    isDragging = false;

    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        dragOffset > 0 ? prevSlide() : nextSlide();
    } else {
        slideBlock.style.transition = 'transform 0.3s ease';
        slideBlock.style.transform = `translateX(-${CENTER_INDEX * slideWidth}px)`;
    }
    dragOffset = 0;
};

// --- Ініціалізація ---
const initSlider = () => {
    slides = Array.from(document.querySelectorAll('.slide'));
    applySlideSizes();
    renderSlides();
    slideBlock.style.opacity = '1';
    slideBlock.style.transition = 'opacity 0.5s ease';
    setHeights();

    if (IS_TOUCH_DEVICE) {
        slider.addEventListener('touchstart', handleTouchStart, { passive: false });
        slider.addEventListener('touchmove', handleTouchMove, { passive: false });
        slider.addEventListener('touchend', handleTouchEnd, { passive: false });
        slider.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    } else {
        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mousemove', handleMouseMove);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mouseleave', handleMouseUp);
    }

    slider.addEventListener('contextmenu', (e) => e.preventDefault());
};

arrowNext.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
arrowPrev.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

// --- Ресайз тільки по ширині ---
let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    if (newWidth !== lastWindowWidth) {
        lastWindowWidth = newWidth;
        applySlideSizes();
        renderSlides();
    }
});

document.addEventListener('DOMContentLoaded', initSlider);
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
});

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//карусель ..............................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const scrollContainer = document.querySelector('.pet-carousel__scroll');

let isDown = false;
let startX;
let scrollLeft;

scrollContainer.style.cursor = 'grab';  // початковий курсор

scrollContainer.addEventListener('mousedown', e => {
  isDown = true;
  startX = e.pageX - scrollContainer.offsetLeft;
  scrollLeft = scrollContainer.scrollLeft;
  scrollContainer.style.cursor = 'grabbing';  // змінюємо курсор при натисканні
  e.preventDefault();
});

scrollContainer.addEventListener('mouseleave', () => {
  isDown = false;
  scrollContainer.style.cursor = 'grab';  // повертаємо курсор
});

scrollContainer.addEventListener('mouseup', () => {
  isDown = false;
  scrollContainer.style.cursor = 'grab';  // повертаємо курсор
});

scrollContainer.addEventListener('mousemove', e => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.offsetLeft;
  const walk = startX - x;
  scrollContainer.scrollLeft = scrollLeft + walk;
});
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//лінії  ..............................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Конфігураційні змінні для стилів та анімації
const LINE_COLORS = ["#ead409", "#ff6f61", "#4caf50", "#2196f3"];
const DOT_COLORS = ["#2196f3", "#2196f3", "#2196f3", "#2196f3"];
const LINE_WIDTH = 3;
const DOT_RADIUS = 6;
const CORNER_RADIUS = 30;
const ANIMATION_EASING = "ease-in-out";
const ANIMATION_DELAY = 0;
const LINE_DIRECTION = "farthest"; //closest farthest
const MOBILE_BREAKPOINT = 440;

let lastViewportWidth = document.documentElement.clientWidth;

function animateLine(path, duration = 800) {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${duration}ms ${ANIMATION_EASING}`;
    path.style.strokeDashoffset = "0";
}

function animateDot(dot, duration = 300) {
    dot.style.opacity = "1";
    dot.style.transition = `opacity ${duration}ms ${ANIMATION_EASING}`;
}

function drawLines() {
    const headings = Array.from(document.querySelectorAll("h2"));
    const edgeOffset = 10;
    const textOffset = 12;
    const viewportWidth = document.documentElement.clientWidth;
    const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

    document.querySelectorAll('.connection-line-svg').forEach(svg => svg.remove());

    for (let i = 0; i < headings.length - 1; i++) {
        const h1 = headings[i];
        const h2 = headings[i + 1];

        const rect1 = h1.getBoundingClientRect();
        const rect2 = h2.getBoundingClientRect();

        let h1Left;
        if (isMobile) {
            h1Left = (i % 2 === 0);
        } else {
            if (LINE_DIRECTION === "closest") {
                h1Left = rect1.left < viewportWidth / 2;
            } else {
                h1Left = rect1.left >= viewportWidth / 2;
            }
        }

        const startX = h1Left ? rect1.left - textOffset : rect1.right + textOffset;
        const startY = rect1.top + rect1.height / 2 + window.scrollY;
        const endX = h1Left ? rect2.left - textOffset : rect2.right + textOffset;
        const endY = rect2.top + rect2.height / 2 + window.scrollY;
        const edgeX = h1Left ? edgeOffset : viewportWidth - edgeOffset;

        const verticalDir = endY > startY ? 1 : -1;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('connection-line-svg');
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.width = "100vw";
        svg.style.height = document.documentElement.scrollHeight + "px";
        svg.style.pointerEvents = "none";
        svg.style.zIndex = "0";

        const pathData = `
            M ${startX} ${startY}
            L ${edgeX - CORNER_RADIUS * (h1Left ? -1 : 1)} ${startY}
            Q ${edgeX} ${startY} ${edgeX} ${startY + CORNER_RADIUS * verticalDir}
            L ${edgeX} ${endY - CORNER_RADIUS * verticalDir}
            Q ${edgeX} ${endY} ${edgeX - CORNER_RADIUS * (h1Left ? -1 : 1)} ${endY}
            L ${endX} ${endY}
        `;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", LINE_COLORS[i % LINE_COLORS.length]);
        path.setAttribute("stroke-width", LINE_WIDTH);
        path.setAttribute("fill", "none");
        path.setAttribute("data-index", i);
        svg.appendChild(path);

        const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startDot.setAttribute("cx", startX);
        startDot.setAttribute("cy", startY);
        startDot.setAttribute("r", DOT_RADIUS);
        startDot.setAttribute("fill", DOT_COLORS[i % DOT_COLORS.length]);
        startDot.style.opacity = "0";
        startDot.setAttribute("data-dot", "start");
        svg.appendChild(startDot);

        const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        endDot.setAttribute("cx", endX);
        endDot.setAttribute("cy", endY);
        endDot.setAttribute("r", DOT_RADIUS);
        endDot.setAttribute("fill", DOT_COLORS[(i + 1) % DOT_COLORS.length]);
        endDot.style.opacity = "0";
        endDot.setAttribute("data-dot", "end");
        svg.appendChild(endDot);

        document.body.appendChild(svg);

        setTimeout(() => {
            path.style.strokeDasharray = path.getTotalLength();
            path.style.strokeDashoffset = path.getTotalLength();
        }, 10);
    }
}

function isHeadingCenteredOrAbove(heading) {
    const rect = heading.getBoundingClientRect();
    const centerY = window.innerHeight / 2;
    return rect.top < centerY;
}

function checkAndAnimateLines() {
    const headings = Array.from(document.querySelectorAll("h2"));
    const svgs = Array.from(document.querySelectorAll('.connection-line-svg'));
    headings.forEach((heading, i) => {
        if (i < svgs.length) {
            const svg = svgs[i];
            const path = svg.querySelector('path');
            const startDot = svg.querySelector('circle[data-dot="start"]');
            const endDot = svg.querySelector('circle[data-dot="end"]');
            if (isHeadingCenteredOrAbove(heading)) {
                if (!path.classList.contains('animated')) {
                    setTimeout(() => {
                        animateDot(startDot);
                        setTimeout(() => {
                            path.classList.add('animated');
                            animateLine(path);
                            setTimeout(() => {
                                animateDot(endDot);
                            }, 800);
                        }, 300);
                    }, ANIMATION_DELAY);
                }
            } else {
                if (!path.classList.contains('animated')) {
                    path.style.strokeDashoffset = path.getTotalLength();
                    startDot.style.opacity = "0";
                    endDot.style.opacity = "0";
                }
            }
        }
    });
}

window.addEventListener("resize", () => {
    const currentViewportWidth = document.documentElement.clientWidth;
    if (Math.abs(currentViewportWidth - lastViewportWidth) > 1) {
        lastViewportWidth = currentViewportWidth;
        drawLines();
        setTimeout(checkAndAnimateLines, 100);
    }
});

window.addEventListener("load", () => {
    lastViewportWidth = document.documentElement.clientWidth;
    drawLines();
    setTimeout(checkAndAnimateLines, 100);
});

window.addEventListener("scroll", checkAndAnimateLines);

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Копіювання тексту........................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function copyValue(icon) {
    const span = icon.parentElement.querySelector('span');
    const originalSVG = icon.innerHTML;

    navigator.clipboard.writeText(span.textContent).then(() => {
      // Заміна вмісту SVG 
      icon.innerHTML = `
   

	<g>
		<path d="M917.5,607.5c-6,26.3-19.2,47.6-42.7,61.7c-13.3,8-27.7,12.5-43.3,12.5c-25.8,0-51.6-0.1-77.4,0.1c-6,0.1-8.3-1.7-8.1-7.9
			c0.3-14.7,0.3-29.5,0-44.2c-0.1-6.1,1.9-8.1,8-8.1c23.3,0.3,46.7,0.1,70,0.1c22.5,0,34.1-11.6,34.1-34.1c0-110.5,0-221,0-331.6
			c0-22.6-11.5-34.1-34.1-34.1c-112.5,0-225,0-337.5,0c-22.6,0-34,11.5-34.1,34.1c0,25.1-0.2,50.1,0.1,75.2c0.1,6.8-2.2,8.9-8.9,8.7
			c-14.5-0.4-29-0.3-43.5,0c-5.5,0.1-7.9-1.3-7.9-7.4c0.3-29.5-0.3-59,0.3-88.4c0.7-36.2,29.2-69.5,66.9-79.6c2.4-0.6,4.7-1.3,7.1-2
			c125.8,0,251.5,0,377.3,0c14.1,3.5,27.5,8.4,39.2,17.4c18.8,14.4,29.3,33.6,34.5,56.3C917.5,359.9,917.5,483.7,917.5,607.5z"/>
		<path d="M425.2,397.7c57.7,0,115.4,0,173.1,0c51.1,0.1,89.8,38.9,89.8,90.1c0,113.2,0.1,226.4,0,339.6c0,51.2-38.8,90-89.9,90
			c-115.4,0.1-230.8,0.1-346.2,0c-50.6,0-89.4-39.1-89.4-89.8c0-113.5-0.1-226.9,0-340.4c0-50.7,38.9-89.6,89.6-89.6
			C309.8,397.7,367.5,397.7,425.2,397.7z M426.1,457.7c-56,0-112,0-168,0c-24.6,0-35.6,11-35.6,35.6c0,109.5,0,219.1,0,328.6
			c0,24.6,11,35.6,35.6,35.6c111.5,0,223,0,334.5,0c24.6,0,35.6-11,35.6-35.6c0-109.5,0-219.1,0-328.6c0-24.6-11-35.6-35.6-35.6
			C537.1,457.7,481.6,457.7,426.1,457.7z"/>
	
	<path d="M593.5,567.4c-0.1-0.3-0.3-0.7-0.4-1c-0.1-0.3-0.3-0.7-0.4-0.9c-4.1-13.2-16.2-22.9-30.1-24c-11.1-0.9-20.9,3-29.9,12.1
		c-35.2,35.3-70.5,70.5-105.8,105.8l-33.3,33.3c-1.2,1.2-2.4,2.4-3.7,3.6c-1.3,1.3-2.7,2.6-4,4c-1.2-1.2-2.4-2.4-3.6-3.6
		c-1.2-1.2-2.3-2.3-3.5-3.5l-15.7-15.7c-12.8-12.8-25.6-25.6-38.4-38.4c-11.5-11.4-27.1-14.4-40.8-7.7
		c-10.3,5.1-17.3,14.3-19.2,25.4c-1.9,11.2,1.8,22.5,10.2,31c22.5,22.8,45.5,45.7,67.8,67.9c6,5.9,11.9,11.9,17.9,17.8
		c6.2,6.2,13.4,9.7,21.4,10.5c1.3,0.1,2.6,0.2,3.9,0.2c9.7,0,18.5-3.9,26.2-11.6c55.8-55.9,112-112.1,167-167
		c6.2-6.2,11.9-12.5,14.5-21.8l0.4-1.3v-13.5L593.5,567.4z"/>
</g>
</svg>

      `;

      setTimeout(() => {
        icon.innerHTML = originalSVG; // Повернення до оригінальної іконки
      }, 1200);
    });
  }
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Анімаця появи секцій......................................................................................................
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function handleScrollOnce() {
  document.querySelectorAll('.open-left, .open-center, .open-right').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0 && !el.dataset.animated) {
      el.classList.add('show');
      el.dataset.animated = 'true';
    }
  });
}

window.addEventListener('scroll', handleScrollOnce);
window.addEventListener('load', handleScrollOnce);



