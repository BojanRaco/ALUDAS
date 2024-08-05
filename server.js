const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const { generateImagesJson } = require('./generateImagesJson'); // Importovanje funkcije

const app = express();
const port = 3000;

// Dummy user data for demonstration purposes
const users = [
    { id: 1, username: 'admin', password: '$2b$10$f2SWxt1i370lBaaJAlfB5ePBiNbdOuCm7h3nyDcoZqn21CNBe.wBi' } // replace with actual hashed password
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// Ruta za prijavu
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        });
    } else {
        res.json({ success: false });
    }
});

// Middleware za proveru autentifikacije
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        res.redirect('/login.html');
    } else {
        next();
    }
}

// Zaštita admin panela
app.get('/admin.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Konfiguracija multer za upload slika
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const section = req.body.section;
        const uploadPath = path.join(__dirname, 'images', section);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Ruta za upload slika
app.post('/upload_image', requireLogin, upload.single('image'), (req, res) => {
    const section = req.body.section;
    const image = req.file;

    if (!image) {
        return res.status(400).json({ message: 'Nema uploadovane slike.' });
    }

    const inputFilePath = image.path;
    const outputFilePath = path.join(__dirname, 'images', 'compressed_images', `${section}_${image.filename}.webp`);

    sharp(inputFilePath)
        .resize({
            width: 1200,
            height: 600,
            fit: sharp.fit.contain,
            background: { r: 60, g: 60, b: 60, alpha: 1 }
        })
        .rotate()
        .webp({ quality: 80 })
        .toFile(outputFilePath)
        .then(() => {
            res.json({ message: 'Slika uspešno uploadovana!' });

            generateImagesJson().catch(console.error);
        })
        .catch(error => {
            console.error('Greška:', error);
            res.status(500).json({ message: 'Greška pri obradi slike.' });
        });
});

// Ruta za brisanje slika
app.post('/delete_image', requireLogin, (req, res) => {
    const section = req.body.section;
    const imageName = req.body.imageName;

    const imagePath = path.join(__dirname, 'images', section, imageName);
    const compressedImagePath = path.join(__dirname, 'images', 'compressed_images', `${section}_${imageName}.webp`);

    console.log(`Trying to delete image: ${imagePath}`);

    if (!fs.existsSync(imagePath)) {
        console.log('Image not found in original directory');
        return res.status(404).json({ message: 'Slika nije pronađena.' });
    }

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.error('Greška pri brisanju slike iz originalnog direktorijuma:', err);
            return res.status(500).json({ message: 'Greška pri brisanju slike.' });
        }

        console.log('Image deleted from original directory successfully');

        if (fs.existsSync(compressedImagePath)) {
            fs.unlink(compressedImagePath, (err) => {
                if (err) {
                    console.error('Greška pri brisanju komprimovane slike:', err);
                    return res.status(500).json({ message: 'Greška pri brisanju komprimovane slike.' });
                }
                console.log('Compressed image deleted successfully');
            });
        }

        generateImagesJson().catch(console.error);

        res.json({ message: 'Slika uspešno obrisana.' });
    });
});

// Pokrenite server
app.listen(port, () => {
    console.log(`Server pokrenut na http://localhost:${port}`);
});
