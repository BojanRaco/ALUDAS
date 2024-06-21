document.addEventListener('DOMContentLoaded', function() {
    const gridItems = document.querySelectorAll('.grid-item img');
    let expanded = false;
    let expandedIndex = 0;
    let expandedImages;

    gridItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            const sliderPicture = e.target.closest('.slider-picture');
            const expandedImage = document.createElement('div');
            expandedImage.classList.add('expanded-image');
            expandedImage.innerHTML = `
                <div class="image-wrapper">
                    <img src="${e.target.src}" alt="${e.target.alt}">
                    <div class="close-btn">&times;</div>
                </div>
            `;
            sliderPicture.appendChild(expandedImage);
            expanded = true;
            expandedIndex = index;
            expandedImages = sliderPicture.querySelectorAll('.grid-item img');

            const closeBtn = expandedImage.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                sliderPicture.removeChild(expandedImage);
                expanded = false;
            });

            expandedImage.addEventListener('click', (event) => {
                if (event.target.classList.contains('close-btn')) return;
                expandedIndex = (expandedIndex + 1) % expandedImages.length;
                const newImageSrc = expandedImages[expandedIndex].src;
                expandedImage.querySelector('img').src = newImageSrc;
            });
        });
    });

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
        const images = activeSlide.querySelectorAll(".grid-item img");
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
            if (expanded) {
                expandedIndex = (expandedIndex - 1 + expandedImages.length) % expandedImages.length;
                const newImageSrc = expandedImages[expandedIndex].src;
                document.querySelector('.expanded-image img').src = newImageSrc;
            } else {
                setSlide(slideIndex - 1);
            }
        });
    });

    document.querySelectorAll(".next").forEach(nextBtn => {
        nextBtn.addEventListener("click", () => {
            if (expanded) {
                expandedIndex = (expandedIndex + 1) % expandedImages.length;
                const newImageSrc = expandedImages[expandedIndex].src;
                document.querySelector('.expanded-image img').src = newImageSrc;
            } else {
                setSlide(slideIndex + 1);
            }
        });
    });

    // Initialize the first slide
    setSlide(0);
});
