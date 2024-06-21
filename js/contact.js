document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Sprečava standardno slanje forme
        if (validateForm()) {
            submitForm();
        } else {
            alert("Molimo popunite sva potrebna polja.");
        }
    });
});

function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    return name !== "" && email !== "" && message !== "";
}

function submitForm() {
    const formData = new FormData(document.getElementById('contactForm'));
    
    fetch('submit_form.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage("Vaša poruka je uspešno poslata. Hvala što nas kontaktirate!");
        } else {
            showErrorMessage("Došlo je do greške. Molimo pokušajte ponovo.");
        }
    })
    .catch(error => {
        showErrorMessage("Došlo je do greške prilikom slanja poruke.");
    });
}

function showSuccessMessage(message) {
    const messageDiv = document.getElementById('messageStatus');
    messageDiv.textContent = message;
    messageDiv.style.color = 'green';
}

function showErrorMessage(message) {
    const messageDiv = document.getElementById('messageStatus');
    messageDiv.textContent = message;
    messageDiv.style.color = 'red';
}
