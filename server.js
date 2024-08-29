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
const port = process.env.PORT || 3001; // Koristi port koji dodeli Heroku ili 3001 za lokalno pokretanje


// Dummy user data for demonstration purposes
const users = [
    { id: 1, username: 'admin', password: '$2b$10$HfAZ4/NK0EiOVv/Phsqfl.haH/HLDNCG1DassthDm6hSp9bs0N11W' }
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'docs')));

// Ruta za posluživanje index.html na korenskom URL-u
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

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
    res.sendFile(path.join(__dirname, 'docs', 'admin.html'));
});

// Konfiguracija multer za upload slika
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const section = req.body.section;
        const uploadPath = path.join(__dirname, 'docs/images', section);
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

    console.log('Uploadovanje slike za sekciju:', section);
    console.log('Primljeni fajl:', image);

    if (!image) {
        console.error('Nema uploadovane slike.');
        return res.status(400).json({ message: 'Nema uploadovane slike.' });
    }

    const inputFilePath = image.path;
    const outputFilePath = path.join(__dirname, 'docs/images/compressed_images', `${section}_${image.filename}.webp`);

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
            console.log('Slika uspešno konvertovana i sačuvana na:', outputFilePath);
            res.json({ message: 'Slika uspešno uploadovana!' });

            generateImagesJson().catch(console.error);
        })
        .catch(error => {
            console.error('Greška pri obradi slike:', error);
            res.status(500).json({ message: 'Greška pri obradi slike.' });
        });
});

// Ruta za brisanje slika
app.post('/delete_image', requireLogin, (req, res) => {
    const section = req.body.section;
    const images = req.body.images;

    if (!section || !images || images.length === 0) {
        return res.status(400).json({ message: 'Invalid section or no images selected.' });
    }

    images.forEach((imageName) => {
        const imagePath = path.join(__dirname, 'docs/images', section, path.basename(imageName));

        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Greška pri brisanju slike iz originalnog direktorijuma:', err);
                    return res.status(500).json({ message: 'Greška pri brisanju slike.' });
                }

                const compressedImagePath = path.join(__dirname, 'docs/images/compressed_images', `${section}_${path.basename(imageName)}.webp`);

                if (fs.existsSync(compressedImagePath)) {
                    fs.unlink(compressedImagePath, (err) => {
                        if (err) {
                            console.error('Greška pri brisanju komprimovane slike:', err);
                            return res.status(500).json({ message: 'Greška pri brisanju komprimovane slike.' });
                        }
                        console.log('Compressed image deleted successfully');
                    });
                }

                console.log('Image deleted from original directory successfully');
            });
        } else {
            console.warn(`Image not found: ${imagePath}`);
        }
    });

    generateImagesJson().catch(console.error);

    res.json({ message: 'Selected images have been successfully deleted.' });
});

// Ruta za dobavljanje slika za odabranu sekciju
app.get('/get_images', (req, res) => {
    const section = req.query.section;
    const sectionPath = path.join(__dirname, 'docs/images', section);

    if (fs.existsSync(sectionPath)) {
        const images = fs.readdirSync(sectionPath).filter(file => {
            return fs.statSync(path.join(sectionPath, file)).isFile();
        });

        res.json({ images });
    } else {
        res.status(404).json({ images: [] });
    }
});

// Dodavanje GET rute za pokretanje generateImagesJson skripte
app.get('/generateImagesJson', (req, res) => {
    generateImagesJson()
        .then(() => {
            res.json({ success: true }); // Vraćamo JSON kao odgovor
        })
        .catch(error => {
            console.error('Greška pri generisanju slika:', error);
            res.status(500).json({ success: false, error: 'Failed to generate images JSON' });
        });
});

// Pokrenite server nakon generisanja slika
generateImagesJson().then(() => {
    app.listen(port, () => {
        console.log(`Server pokrenut na http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Greška pri generisanju slika:', error);
});
