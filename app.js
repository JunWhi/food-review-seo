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

// Function to calculate the average rating
const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0; // Return 0 if no reviews
    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = sumRatings / reviews.length;
    return !isNaN(average) ? average.toFixed(2) : 0; // Ensure it's a valid number
};

// Route to show all businesses
app.get('/business', async (req, res) => {
    const businesses = await Business.find({});
    res.render('businesses/index', { businesses });
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
    const business = await Business.findById(id).populate('reviews');
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
    res.redirect('/business');
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
    const averageRating = calculateAverageRating(business.reviews);
    business.averageRating = averageRating;

    // Save the updated business
    await business.save();

    res.redirect(`/business/${id}`);
});

// Route to add a new review to a business
app.post('/business/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Create a new review and save it
    const review = new Review({ rating, comment, businessId: id });
    await review.save();

    // Add the review to the business's reviews array
    const business = await Business.findById(id);
    business.reviews.push(review);

    // Recalculate the new average rating
    const averageRating = calculateAverageRating(business.reviews);
    business.averageRating = averageRating;

    // Save the updated business
    await business.save();

    // Redirect to the business detail page
    res.redirect(`/business/${id}`);
});

// Route to add a new review to a business
app.post('/business/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Create a new review and save it
    const review = new Review({ rating, comment, businessId: id });
    await review.save();

    // Add the review to the business's reviews array
    const business = await Business.findById(id);
    business.reviews.push(review); // Add the review

    // Recalculate the new average rating
    const averageRating = calculateAverageRating(business.reviews);
    business.averageRating = averageRating; // Update the average rating

    // Save the updated business
    await business.save();

    // Redirect to the business detail page
    res.redirect(`/business/${id}`);
});


// Server listening
app.listen(2114, () => {
    console.log('Server is running on port 2098');
});
