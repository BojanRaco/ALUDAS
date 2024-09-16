document.addEventListener('DOMContentLoaded', function() {
    // Dinamičko učitavanje slika iz images.json fajla
    fetch('images.json')
        .then(response => response.json())
        .then(data => {
            // Učitavanje slika za products sekciju
            Object.keys(data.product_images).forEach(category => {
                const sliderSection = document.getElementById(`slider-section-${category}`);
                if (sliderSection) {
                    const galleryWrapper = sliderSection.querySelector('.gallery-wrapper');
                    
                    data.product_images[category].forEach(image => {
                        const imgElement = document.createElement('img');
                        imgElement.src = image.src;
                        imgElement.alt = image.alt;
                        imgElement.loading = "lazy";
                        imgElement.classList.add('grid-item'); // Dodaj klasu za pregled slika
                        galleryWrapper.appendChild(imgElement);
                    });
                }
            });

            // Aktiviraj funkcionalnosti za pregled slika nakon dinamičkog učitavanja
            activateImagePreview();
            showSlides(slideIndex);
        })
        .catch(error => console.error('Error loading images:', error));

    let slideIndex = 0;

    function showSlides(n) {
        const slides = document.getElementsByClassName("slider-section");
        if (n >= slides.length) {
            slideIndex = 0;
        } else if (n < 0) {
            slideIndex = slides.length - 1;
        } else {
            slideIndex = n;
        }
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
            slides[i].style.display = "none"; // Ensure all slides are hidden
        }
        slides[slideIndex].style.display = "flex";
        slides[slideIndex].classList.add("active");
        showImageGrid();
    }

    function plusSlides(n) {
        showSlides(slideIndex + n);
    }

    function showImageGrid() {
        const activeSlide = document.querySelector(".slider-section.active");
        if (!activeSlide) return; // Provera da li postoji aktivni slide
        const images = activeSlide.querySelectorAll(".grid-item");
        const imageGrid = activeSlide.querySelector(".image-grid");

        if (imageGrid) {
            imageGrid.style.display = 'grid';
            images.forEach(image => {
                image.style.transform = "scale(1)";
                image.style.opacity = "1";
                image.style.zIndex = "1";
                image.style.display = 'block';
            });
        }
    }

    function setSlide(n) {
        showSlides(n);
    }

    document.querySelectorAll(".prev").forEach(prevBtn => {
        prevBtn.addEventListener("click", () => {
            setSlide(slideIndex - 1);
        });
    });

    document.querySelectorAll(".next").forEach(nextBtn => {
        nextBtn.addEventListener("click", () => {
            setSlide(slideIndex + 1);
        });
    });

    // Aktiviraj funkcionalnosti za pregled slika
    function activateImagePreview() {
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                let expandedImageIndex = index;
                const sliderPicture = item.closest('.slider-picture');
                const imageGrid = sliderPicture.querySelector('.image-grid');
                const gridImages = imageGrid.querySelectorAll('.grid-item');
                const expandedImage = document.createElement('div');
                expandedImage.classList.add('expanded-image');
                expandedImage.innerHTML = `
                    <div class="image-wrapper">
                        <img src="${item.src}" alt="${item.alt}">
                        <div class="close-btn">&times;</div>
                    </div>
                `;
                expandedImage.style.position = 'fixed';
                expandedImage.style.top = '0';
                expandedImage.style.left = '0';
                expandedImage.style.width = '100%';
                expandedImage.style.height = '100%';
                expandedImage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                expandedImage.style.display = 'flex';
                expandedImage.style.justifyContent = 'center';
                expandedImage.style.alignItems = 'center';
                expandedImage.style.zIndex = '1000';

                const imgWrapper = expandedImage.querySelector('.image-wrapper');
                imgWrapper.style.position = 'relative';

                const img = expandedImage.querySelector('img');
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90%';

                imageGrid.appendChild(expandedImage);

                const closeBtn = expandedImage.querySelector('.close-btn');
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '10px';
                closeBtn.style.right = '10px';
                closeBtn.style.color = '#fff';
                closeBtn.style.fontSize = '24px';
                closeBtn.style.cursor = 'pointer';

                closeBtn.addEventListener('click', () => {
                    imageGrid.removeChild(expandedImage);
                });

                // Dodavanje swipe podrške i onemogućavanje strelica na touchscreen uređajima
                if (isTouchDevice()) {
                    addSwipeSupport(expandedImage, gridImages, expandedImageIndex);
                } else {
                    // Ako nije touchscreen, dodajemo navigacione strelice
                    addImageNavigation(expandedImage, gridImages, expandedImageIndex);
                }
            });
        });
    }

    // Funkcija za navigaciju između slika (koristi se samo za non-touchscreen uređaje)
    function addImageNavigation(expandedImage, gridItems, expandedImageIndex) {
        const img = expandedImage.querySelector('img');
        
        const prevBtn = document.createElement('div');
        prevBtn.classList.add('nav-btn', 'prev-btn');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.style.position = 'absolute';
        prevBtn.style.top = '50%';
        prevBtn.style.left = '10px';
        prevBtn.style.color = '#fff';
        prevBtn.style.fontSize = '24px';
        prevBtn.style.cursor = 'pointer';
        prevBtn.style.transform = 'translateY(-50%)';
        
        const nextBtn = document.createElement('div');
        nextBtn.classList.add('nav-btn', 'next-btn');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.style.position = 'absolute';
        nextBtn.style.top = '50%';
        nextBtn.style.right = '10px';
        nextBtn.style.color = '#fff';
        nextBtn.style.fontSize = '24px';
        nextBtn.style.cursor = 'pointer';
        nextBtn.style.transform = 'translateY(-50%)';

        expandedImage.appendChild(prevBtn);
        expandedImage.appendChild(nextBtn);

        prevBtn.addEventListener('click', () => {
            expandedImageIndex = (expandedImageIndex - 1 + gridItems.length) % gridItems.length;
            const prevImg = gridItems[expandedImageIndex];
            img.src = prevImg.src;
            img.alt = prevImg.alt;
        });

        nextBtn.addEventListener('click', () => {
            expandedImageIndex = (expandedImageIndex + 1) % gridItems.length;
            const nextImg = gridItems[expandedImageIndex];
            img.src = nextImg.src;
            img.alt = nextImg.alt;
        });
    }

    // Funkcija za podršku prevlačenja prstom (koristi se samo na touchscreen uređajima)
    function addSwipeSupport(expandedImage, gridItems, expandedImageIndex) {
        let startX = 0;
        let endX = 0;
        const img = expandedImage.querySelector('img');

        expandedImage.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });

        expandedImage.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;

            if (startX > endX + 50) {
                // Swipe left
                expandedImageIndex = (expandedImageIndex + 1) % gridItems.length;
                const nextImg = gridItems[expandedImageIndex];
                img.src = nextImg.src;
                img.alt = nextImg.alt;
            } else if (startX < endX - 50) {
                // Swipe right
                expandedImageIndex = (expandedImageIndex - 1 + gridItems.length) % gridItems.length;
                const prevImg = gridItems[expandedImageIndex];
                img.src = prevImg.src;
                img.alt = prevImg.alt;
            }
        });
    }

    // Funkcija koja proverava da li je uređaj touchscreen
    function isTouchDevice() {
        return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    // Initialize the first slide
    setSlide(0);
});
