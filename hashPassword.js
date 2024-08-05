const bcrypt = require('bcrypt');

const password = 'yourPasswordHere';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log(hash);
});
