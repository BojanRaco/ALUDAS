document.addEventListener('DOMContentLoaded', function () {
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
        .catch(error => console.error('Greška prilikom učitavanja slika:', error));

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
            slides[i].style.display = "none"; // Sakrij sve slajdove
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
                expandedImage.style.position = 'absolute';
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

                // Onemogući swipe za slider sekcije dok je slika uvećana
                disableSwipeForSliderSections();

                const closeBtn = expandedImage.querySelector('.close-btn');
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '1rem';
                closeBtn.style.right = '1rem';
                closeBtn.style.color = '#fff';
                closeBtn.style.fontSize = '2rem';
                closeBtn.style.cursor = 'pointer';

                closeBtn.addEventListener('click', () => {
                    imageGrid.removeChild(expandedImage);
                    enableSwipeForSliderSections(); // Ponovo omogući swipe za slider sekcije kada se zatvori slika
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
        prevBtn.style.left = '1rem';
        prevBtn.style.color = '#fff';
        prevBtn.style.fontSize = '2rem';
        prevBtn.style.cursor = 'pointer';
        prevBtn.style.transform = 'translateY(-50%)';
        
        const nextBtn = document.createElement('div');
        nextBtn.classList.add('nav-btn', 'next-btn');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.style.position = 'absolute';
        nextBtn.style.top = '50%';
        nextBtn.style.right = '1rem';
        nextBtn.style.color = '#fff';
        nextBtn.style.fontSize = '2rem';
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
                // Prevlačenje levo
                expandedImageIndex = (expandedImageIndex + 1) % gridItems.length;
                const nextImg = gridItems[expandedImageIndex];
                img.src = nextImg.src;
                img.alt = nextImg.alt;
            } else if (startX < endX - 50) {
                // Prevlačenje desno
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

    // Swipe podrška za slider sekcije
    function addSwipeSupportForSlider(sliderContainer) {
        let startX = 0;
        let endX = 0;

        sliderContainer.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });

        sliderContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;

            if (startX > endX + 50) {
                // Prevlačenje levo za sledeću slider sekciju
                plusSlides(1);
            } else if (startX < endX - 50) {
                // Prevlačenje desno za prethodnu slider sekciju
                plusSlides(-1);
            }
        });
    }

    // Onemogući swipe za slider sekcije
    function disableSwipeForSliderSections() {
        sliderContainers.forEach(slider => {
            slider.removeEventListener('touchstart', handleSwipeStart);
            slider.removeEventListener('touchend', handleSwipeEnd);
        });
    }

    // Omogući swipe za slider sekcije
    function enableSwipeForSliderSections() {
        sliderContainers.forEach(slider => {
            slider.addEventListener('touchstart', handleSwipeStart);
            slider.addEventListener('touchend', handleSwipeEnd);
        });
    }

    function handleSwipeStart(e) {
        startX = e.changedTouches[0].screenX;
    }

    function handleSwipeEnd(e) {
        endX = e.changedTouches[0].screenX;

        if (startX > endX + 50) {
            plusSlides(1);
        } else if (startX < endX - 50) {
            plusSlides(-1);
        }
    }

    // Aktiviraj swipe funkcionalnost za svaku slider sekciju
    const sliderContainers = document.querySelectorAll('.slider-container');
    sliderContainers.forEach(slider => {
        slider.addEventListener('touchstart', handleSwipeStart);
        slider.addEventListener('touchend', handleSwipeEnd);
    });

    // Inicijalizuj prvi slajd
    setSlide(0);

    // Dodaj pravilo za ekrane manje od 10.1" u landscape i portrait modovima
    function applyMobileLayout() {
        const sliderContainers = document.querySelectorAll('.slider-container');
        const sliderPictures = document.querySelectorAll('.slider-picture');
        const sliderDescriptions = document.querySelectorAll('.slider-description');

        if (window.innerWidth <= 1024) {
            sliderContainers.forEach(container => {
                container.style.display = 'flex';
                container.style.flexDirection = 'column'; // Postavlja vertikalni prikaz
                container.style.width = '100%';
                container.style.height = 'auto';
            });

            sliderPictures.forEach(picture => {
                picture.style.width = '100%'; // Slika zauzima 100% širine
                picture.style.height = 'auto';
                picture.style.marginBottom = '1rem'; // Razmak između slike i opisa
            });

            sliderDescriptions.forEach(description => {
                description.style.width = '100%'; // Opis zauzima 100% širine
                description.style.height = 'auto';
                description.style.display = 'flex';
                description.style.justifyContent = 'center';
                description.style.alignItems = 'center';
                description.style.padding = '1rem';
            });
        }
    }

    // Pozovi funkciju na učitavanje stranice
    applyMobileLayout();

    // Ponovo primeni stilove prilikom promene veličine ekrana i orijentacije
    window.addEventListener('resize', applyMobileLayout);
    window.addEventListener('orientationchange', applyMobileLayout);
});
