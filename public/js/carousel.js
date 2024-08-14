document.addEventListener('DOMContentLoaded', async () => {
    const sliderContainer = document.querySelector('.slider-container');
    const indicators = document.querySelector('.slider-indicators');
    const isTouchDevice = 'ontouchstart' in document.documentElement;

    let currentIndex = 0;
    let direction = 1;

    try {
        const response = await fetch('images.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();

        const images = data.index_slider;
        images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = image.src;
            imgElement.alt = image.alt;
            imgElement.classList.add('slider-item');
            sliderContainer.appendChild(imgElement);

            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) {
                indicator.classList.add('active');
            }
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
            indicators.appendChild(indicator);
        });

        const slides = document.querySelectorAll('.slider-item');
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');

        function updateCarousel() {
            sliderContainer.style.transform = `translateX(-${currentIndex * 100}vw)`;
            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function showNextSlide() {
            if (direction === 1) {
                if (currentIndex === slides.length - 1) {
                    direction = -1;
                } else {
                    currentIndex += 1;
                }
            } else {
                if (currentIndex === 0) {
                    direction = 1;
                } else {
                    currentIndex -= 1;
                }
            }
            updateCarousel();
        }

        function showPrevSlide() {
            if (direction === -1) {
                if (currentIndex === 0) {
                    direction = 1;
                } else {
                    currentIndex -= 1;
                }
            } else {
                if (currentIndex === slides.length - 1) {
                    direction = -1;
                } else {
                    currentIndex += 1;
                }
            }
            updateCarousel();
        }

        if (!isTouchDevice) {
            // Automatsko skrolovanje
            setInterval(showNextSlide, 3000);

            // Manuelno skrolovanje
            nextBtn.addEventListener('click', showNextSlide);
            prevBtn.addEventListener('click', showPrevSlide);
        } else {
            // Dodavanje prevlačenja (swipe) za touchscreen uređaje
            let touchStartX = 0;
            let touchEndX = 0;

            sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleGesture();
            });

            function handleGesture() {
                if (touchEndX < touchStartX) {
                    showNextSlide();
                }
                if (touchEndX > touchStartX) {
                    showPrevSlide();
                }
            }
        }

        // Inicijalno ažuriranje carousel-a
        updateCarousel();

    } catch (error) {
        console.error("Greska prilikom učitavanja JSON podataka: ", error);
    }
});
