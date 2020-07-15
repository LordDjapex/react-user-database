//SETUP

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/wikipedia', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const contentModel = mongoose.model('pages', new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    content: {type: String, required: true}
}))


const port = process.env.PORT || 3000;
const app = express();

console.log(__dirname)
app.set('views', 'public')
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
//app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

//SETUP

//FUNCTIONS

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

const addPage = (({name, content}) => {
    new contentModel({'name': capitalizeFirstLetter(name.trim()), content}).save().then(() =>{
        console.log('Success')
    }
    ).catch(() => {
        console.log('Failure')
    });
})


let array = []
function values() { 
    db.collection('pages').find(async (err, object) => {
    if (err) {
        console.log(err)
        return;
    }

    let pageNames = []

    await object.forEach((doc) => {
        pageNames.push(doc.name)
    })

    
   array = pageNames
})
}


//PAGES AND MISCS

app.get('/',  (req, res) => {
    values();
    res.render('index', {array})
})

app.get('/addPage/add', (req, res) => {
    res.render('add')
})

app.post('/addPage/redirect', async (req, res) => {
    const name = req.body.pagename
    console.log(name)
    const content = req.body.contentarea
    console.log(content)
    addPage({name, content})
    res.redirect('/')
})

app.get('/:pagename', async (req, res) => {
    const pagename = capitalizeFirstLetter(req.params.pagename.trim())
    console.log(pagename)
    content = ''
    const page = await contentModel.findOne({'name': pagename}, (err, object) => {
        if (err) {
            return err;
        }

        if (object == null) {
            return console.log('Content is null')
        }
        console.log(object.content)
        content = object.content
        return object;
    }).then(() => {
        res.render('page', {name: pagename, content: content})
    }).catch('Error at page')
})

app.listen(port, () => {
    console.log('listening on ' + port)
})