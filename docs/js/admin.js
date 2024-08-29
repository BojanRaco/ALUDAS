document.addEventListener("DOMContentLoaded", function() {
    const folderSelect = document.getElementById('sectionDelete');
    const imagesContainer = document.getElementById('imagesContainer');
    const deleteButton = document.querySelector('#imageDeleteForm button[type="submit"]');
    const returnToSiteButton = document.getElementById('returnToSite');
    const operationStatus = document.getElementById('message');

    folderSelect.addEventListener('change', loadImages);
    deleteButton.addEventListener('click', deleteSelectedImages);
    returnToSiteButton.addEventListener('click', returnToSite);

    function loadImages() {
        const folder = folderSelect.value;
        fetch(`/get_images?section=${folder}`)
            .then(response => response.json())
            .then(data => {
                imagesContainer.innerHTML = ''; // Očisti prethodne slike
                data.images.forEach(image => {
                    const imageWrapper = document.createElement('div');
                    imageWrapper.classList.add('image-wrapper');
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = `/images/${folder}/${image}`;
                    imgElement.alt = image;
                    imgElement.style.width = '100px'; // Primer dimenzije
                    imgElement.style.height = 'auto';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = image;
                    checkbox.classList.add('image-checkbox');
                    
                    imageWrapper.appendChild(imgElement);
                    imageWrapper.appendChild(checkbox);
                    imagesContainer.appendChild(imageWrapper);
                });
            })
            .catch(error => console.error('Error loading images:', error));
    }

    function deleteSelectedImages(event) {
        event.preventDefault();
        
        const selectedImages = Array.from(document.querySelectorAll('.image-checkbox:checked'))
                                    .map(checkbox => checkbox.value);

        if (selectedImages.length === 0) {
            alert('Nijedna slika nije odabrana za brisanje.');
            return;
        }

        const folder = folderSelect.value;

        fetch('/delete_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ section: folder, images: selectedImages })
        })
        .then(response => response.json())
        .then(data => {
            operationStatus.textContent = data.message;
            loadImages(); // Ponovno učitaj slike nakon brisanja
            generateImagesJson(); // Pokreni generisanje slika nakon brisanja
        })
        .catch(error => console.error('Error deleting images:', error));
    }

    function returnToSite() {
        fetch('/generateImagesJson')
            .then(response => {
                if (response.ok) {
                    window.location.href = '/index.html'; // Preusmerava na index stranu nakon što skripta završi
                } else {
                    console.error('Error generating images JSON');
                }
            })
            .catch(error => console.error('Error generating images JSON:', error));
    }

    function generateImagesJson() {
        return fetch('/generateImagesJson')
            .then(response => {
                if (!response.ok) {
                    console.error('Error generating images JSON');
                    throw new Error('Failed to generate images JSON');
                }
            })
            .catch(error => console.error('Error generating images JSON:', error));
    }

    document.getElementById('imageUploadForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Sprečava ponovno učitavanje stranice

        const formData = new FormData(this); // Kreiraj FormData objekat sa podacima iz forme

        fetch('/upload_image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message); // Prikaz poruke o uspehu ili grešci
                generateImagesJson(); // Pokreni generisanje slika nakon dodavanja slike
                window.location.reload(); // Ponovno učitavanje admin panela
            }
        })
        .catch(error => console.error('Error uploading image:', error));
    });

    // Automatski učitaj slike za podrazumevani odabir
    loadImages();
});
