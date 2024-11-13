const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Business = require('./models/business');
const Review = require('./models/review');

const url = 'mongodb+srv://whi:whi123@cluster-food-search.8hbkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-food-search'
mongoose.set('strictQuery', true); // 또는 false로 설정 가능

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/business', async(req, res) => {
    const business = await Business.find({});
    console.log(business);
    res.render('businesses/index', { business });
})


// GET route for the new business form
app.get('/business/new', (req, res) => {
    res.render('businesses/new'); // Render the new business form
});

// POST route for creating a new business
app.post('/business', async (req, res) => {
    try {
        const { business } = req.body; // Get business info from the form
        const newBusiness = new Business(business); // Create a new business instance
        await newBusiness.save(); // Save to MongoDB
        res.redirect(`/business/${newBusiness._id}`); // Redirect to the show page for the new business
    } catch (err) {
        res.status(500).send('Error saving business');
    }
});

// GET route for displaying a specific business
app.get('/business/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const business = await Business.findById(id); // Find business by ID
        res.render('businesses/show', { business }); // Render the show page for the business
    } catch (err) {
        res.status(404).send('Business not found');
    }
});

app.listen(3034, () => {
    console.log('Serving on port 3034')
})