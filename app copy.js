const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Business = require('./models/business');
const Review = require('./models/review');
//const Business = require('./models/FoodBusiness'); // Business 모델 불러오기


//const url = 'mongodb+srv://wchang15:UC252SzLuKH85KHU@cluster0.dzz0w.mongodb.net/yelpclone?retryWrites=true&w=majority&appName=Cluster0'
const url = 'mongodb+srv://whi:whi123@cluster-food-search.8hbkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-food-search'
const Schema = mongoose.Schema;
// Business Schema
const BusinessSchema = new Schema({
    title: String,
    location: String,
    description: String
});

module.exports = mongoose.model('Business', BusinessSchema);

mongoose.set('strictQuery', true); // 또는 false로 설정 가능


mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) // /views/business/new.js

app.use(express.urlencoded({ extended: true }));

app.use(express.json()); //

app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/business', async(req, res) => {
    const business = await Business.find({});
    console.log(business);
    res.render('businesses/index', { business });
})

// GET 
app.get('/business/new', (req, res) => {
    res.render('businesses/new'); // 'businesses' 폴더 아래에 있는 new.ejs 파일 렌더링
  });
  


// POST 요청: 폼 데이터를 몽고DB에 저장
app.post('/business', async (req, res) => {
    try {
        const { business } = req.body; // 폼 데이터에서 비즈니스 정보 가져오기
        const newBusiness = new Business(business); // 새로운 비즈니스 인스턴스 생성
        await newBusiness.save(); // 비즈니스 정보를 몽고DB에 저장

        // 저장된 문서의 ID로 리다이렉트
        res.redirect(`/business/${newBusiness._id}`);
    } catch (err) {
        res.status(500).send('Error saving business');
    }
});

// // POST 요청 처리
// app.post('/business', (req, res) => {
//     // req.body로 폼에서 전송된 데이터 접근
//     const { business } = req.body; // business 객체에 title, location, description이 들어 있음

//     const title = business.title;
//     const location = business.location;
//     const description = business.description;

//     // 여기서 데이터베이스에 저장하거나 추가적인 로직을 처리할 수 있습니다.
//     console.log('Received business:', title, location, description);

//     // 처리 후 결과 응답
//     res.send(`Business Created: Title - ${title}, Location - ${location}, Description - ${description}`);
// });


// app.get('/business/edit', (req, res) => {
//     res.render('businesses/edit'); // 'businesses' 폴더 아래에 있는 new.ejs 파일 렌더링
// });

// GET 요청: 저장된 비즈니스 정보 보여주기
app.get('/business/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const business = await Business.findById(id); // ID로 비즈니스 정보 조회
        res.render('businesses/show', { business }); // 비즈니스 정보 렌더링
    } catch (err) {
        res.status(404).send('Business not found');
    }
});



app.get('/business/index', (req, res) => {
    res.render('businesses/index'); // 'businesses' 폴더 아래에 있는 new.ejs 파일 렌더링
});

app.get('/business/show', (req, res) => {
    res.render('businesses/show'); // 'businesses' 폴더 아래에 있는 new.ejs 파일 렌더링
  });

app.listen(3007, () => {
    console.log('Serving on port 3007')
})