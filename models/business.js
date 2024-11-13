const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessSchema = new Schema({
    title: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Business', BusinessSchema);


// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const BusinessSchema = new Schema ({
//     title: String,
//     description: String,
//     location: String,
//     reviews : [
//         {
//             type: Schema.Types.ObjectId,
//             ref: 'Review'
//         }
//     ]
// });



// module.exports = mongoose.model('Business', BusinessSchema);
