document.getElementById('imageUploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append('section', document.getElementById('section').value);
    formData.append('image', document.getElementById('image').files[0]);

    fetch('/upload_image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = data.message;
        refreshImageList(); // Osveži listu slika
        fetch('/refresh_images'); // Pokreće generateImagesJson za ažuriranje images.json
        reloadPageWithTimestamp(); // Osveži stranicu kako bi se slike ažurirale na sajtu
    })
    .catch(error => {
        document.getElementById('message').innerText = 'Greška pri uploadu slike.';
        console.error('Greška:', error);
    });
});

document.getElementById('sectionDelete').addEventListener('change', function() {
    refreshImageList();
});

document.getElementById('imageDeleteForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let section = document.getElementById('sectionDelete').value;
    let imageName = document.getElementById('imageName').value;

    fetch('/delete_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ section, imageName })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').innerText = data.message;
        refreshImageList(); // Osveži listu slika
        fetch('/refresh_images'); // Pokreće generateImagesJson za ažuriranje images.json
        reloadPageWithTimestamp(); // Osveži stranicu kako bi se slike ažurirale na sajtu
    })
    .catch(error => {
        document.getElementById('message').innerText = 'Greška pri brisanju slike.';
        console.error('Greška:', error);
    });
});

function refreshImageList() {
    let section = document.getElementById('sectionDelete').value;
    const timestamp = new Date().getTime();

    fetch(`/get_images?section=${section}&timestamp=${timestamp}`)
    .then(response => response.json())
    .then(data => {
        let imageSelect = document.getElementById('imageName');
        imageSelect.innerHTML = '<option value="">Dostupne slike</option>';
        data.images.forEach(image => {
            let option = document.createElement('option');
            option.value = image.alt.split(' ')[1]; // Use alt to get the original filename
            option.textContent = image.alt; // Use alt as display text
            imageSelect.appendChild(option);
        });
    })
    .catch(error => {
        document.getElementById('message').innerText = 'Greška pri učitavanju slika.';
        console.error('Greška:', error);
    });
}

function reloadPageWithTimestamp() {
    const timestamp = new Date().getTime();
    window.location.href = window.location.href.split('?')[0] + `?timestamp=${timestamp}`;
}
