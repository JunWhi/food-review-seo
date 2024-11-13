const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Business = require('./models/business');
const Review = require('./models/review');

const app = express();

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // Allow PUT and DELETE methods

const url = 'mongodb+srv://whi:whi123@cluster-food-search.8hbkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-food-search';
mongoose.set('strictQuery', true);

// MongoDB connection
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected");
}).catch(err => {
    console.log("MongoDB Connection Error:", err);
});

// EJS setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Route to show all businesses
app.get('/business', async (req, res) => {
    const business = await Business.find({});
    console.log(business);
    res.render('businesses/index', { business });
});

// Route to show a form to add a new business
app.get('/business/new', (req, res) => {
    res.render('businesses/new');
});

// Route to add new business
app.post('/business', async (req, res) => {
    const { business } = req.body;
    const newBusiness = new Business(business);
    await newBusiness.save();
    res.redirect(`/business/${newBusiness._id}`);
});

// Route to show details of a business
app.get('/business/:id', async (req, res) => {
    const { id } = req.params;
    const business = await Business.findById(id);
    res.render('businesses/show', { business });
});

// Route to show update form
app.get('/business/:id/update', async (req, res) => {
    const { id } = req.params;
    const business = await Business.findById(id);
    res.render('businesses/update', { business });
});

// Route to handle update
app.put('/business/:id', async (req, res) => {
    const { id } = req.params;
    const { business } = req.body;
    await Business.findByIdAndUpdate(id, business);
    res.redirect(`/business/${id}`);
});

// Route to delete a business
app.delete('/business/:id', async (req, res) => {
    const { id } = req.params;
    await Business.findByIdAndDelete(id);
    res.redirect('/business'); // Redirect to the main business listing page
});

// Route to delete a review
app.delete("/business/:id/reviews/:reviewId", async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review from the Business's reviews array
    await Business.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    // Delete the review from the Review collection
    await Review.findByIdAndDelete(reviewId);

    // Recalculate the average rating
    const business = await Business.findById(id).populate('reviews');
    if (business.reviews.length > 0) {
        const totalRatings = business.reviews.length;
        const sumRatings = business.reviews.reduce((sum, review) => sum + review.rating, 0);
        const newAverage = (sumRatings / totalRatings);
        business.averageRating = !isNaN(newAverage) ? newAverage.toFixed(2) : 0; // Ensure it's a valid number
    } else {
        business.averageRating = 0; // No reviews left, reset averageRating
    }

    // Save the updated business
    await business.save();

    res.redirect(`/business/${id}`);
});

// Route to add a new review to a business
app.post('/business/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { rating, body } = req.body;

    // Create a new review and save it
    const review = new Review({ rating, body });
    await review.save();

    // Add the review to the business's reviews array
    const business = await Business.findById(id);
    business.reviews.push(review);
    
    // Calculate the new average rating
    const totalRatings = business.reviews.length;
    const sumRatings = business.reviews.reduce((sum, review) => sum + review.rating, 0);
    const newAverage = (sumRatings / totalRatings);

    // Ensure the average rating is a valid number
    business.averageRating = !isNaN(newAverage) ? newAverage.toFixed(2) : 0;

    // Save the updated business
    await business.save();

    res.redirect(`/business/${id}`);
});

// Server listening
app.listen(3033, () => {
    console.log('Server is running on port 3019');
});
