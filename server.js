const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studyhub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/User');
const Subject = require('./models/Subject');
const Task = require('./models/Task');
const Resource = require('./models/Resource');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
// Auth routes
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Subject routes
app.get('/api/subjects', authenticateToken, async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.user.id });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/subjects', authenticateToken, async (req, res) => {
    try {
        const subject = new Subject({
            userId: req.user.id,
            ...req.body
        });
        await subject.save();
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Task routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const task = new Task({
            userId: req.user.id,
            ...req.body
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { completed: req.body.completed },
            { new: true }
        );
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Resource routes
app.get('/api/resources', authenticateToken, async (req, res) => {
    try {
        const resources = await Resource.find({ userId: req.user.id });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/resources', authenticateToken, async (req, res) => {
    try {
        const resource = new Resource({
            userId: req.user.id,
            ...req.body
        });
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 