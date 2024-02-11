const express = require("express");
const router = express.Router();
const path = require('path');
const User = require('./models/user');
const Doctor = require('./models/Doctor');
const verifyToken = require('./verifyToken');


// console.log(require('fs').readdirSync(path.join(__dirname, '../middleware')));
const isAuthenticated = require('./middleware/isAuthenticated'); // Adjust the path accordingly

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/error', (req, res) => {
  res.render('error');
});
router.get('/doctorAuth', (req, res) => {
  res.render('doctorAuth');
});
router.post('/signup', async (req, res) => {
  try {
      const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          phone: req.body.phone,
          fullName: req.body.fullName,
          dob: req.body.dob,
          gender: req.body.gender,
      });

      await newUser.save();
      console.log(req.body);
      res.send("User signed up successfully!");
  } catch (err) {
      console.error(err);
      res.status(500).send("Error saving user to the database");
  }
});


router.post('/register', async (req, res) => {
  try {
      const { department, fullName, username, password, gender, phone, email } = req.body;

      // Check if the email is already registered
      const existingDoctor = await Doctor.findOne({ email });

      if (existingDoctor) {
          return res.status(400).json({ error: 'Email is already registered' });
      }

      // Create a new Doctor instance
      const newDoctor = new Doctor({
          department,
          fullName,
          username,
          password, // Hash the password before saving (use bcrypt or a similar library)
          gender,
          phone,
          email,
      });

      // Save the new Doctor to the database
      await newDoctor.save();

      res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Handle Doctor login
router.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      // Find the Doctor by username
      const doctor = await Doctor.findOne({ username });

      if (!doctor || doctor.password !== password) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Successfully logged in
      res.status(200).json({ message: 'Login successful', doctor });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});





// function isAuthenticated(req, res, next) {
//   console.log("isAuthenticated middleware called");
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// }

router.get('/dashboard', isAuthenticated,(req, res) => {
  res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.redirect('/');
    }
    res.clearCookie('token');
    res.redirect('/');
  });
});

module.exports = router;
// module.exports.isAuthenticated = isAuthenticated;