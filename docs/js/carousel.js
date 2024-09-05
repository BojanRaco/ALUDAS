document.addEventListener('DOMContentLoaded', async () => {
    const sliderContainer = document.querySelector('.slider-container');
    const indicators = document.querySelector('.slider-indicators');
    const isTouchDevice = 'ontouchstart' in document.documentElement;

    let currentIndex = 0;
    let autoSlideInterval;

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
                resetAutoSlide(); // Resetovanje automatskog slajdera na klik indikatora
            });
            indicators.appendChild(indicator);
        });

        const slides = document.querySelectorAll('.slider-item');

        function updateCarousel() {
            sliderContainer.style.transform = `translateX(-${currentIndex * 100}vw)`;
            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function showNextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }

        function showPrevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(showNextSlide, 3000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        if (!isTouchDevice) {
            // Automatsko skrolovanje
            startAutoSlide();

            // Manuelno skrolovanje
            document.querySelector('.next').addEventListener('click', () => {
                showNextSlide();
                resetAutoSlide();
            });
            document.querySelector('.prev').addEventListener('click', () => {
                showPrevSlide();
                resetAutoSlide();
            });
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
                resetAutoSlide(); // Resetovanje automatskog slajdera na swipe
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

        // Automatsko pokretanje videa (ako postoji video u slideru)
        const videoElements = document.querySelectorAll('.process-video video');
        videoElements.forEach(video => {
            video.play();
        });

    } catch (error) {
        console.error("Greska prilikom učitavanja JSON podataka: ", error);
    }
});
