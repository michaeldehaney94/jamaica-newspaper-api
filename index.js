const express = require('express');
//cheerio is used to manipulate and target/access element names to scrape information from a site.
const cheerio = require('cheerio');
//axios will use promises to send HTTP request to endpoints to perform CRUD operations
const axios = require('axios');
const port = process.env.port || 4000;
const app = express();

//collection is used as a object array to loop through multiple url rather than one at a time
const collection = [
{
    name: 'loop',
    address: 'https://jamaica.loopnews.com/category/loopjamaica-jamaica-news',
    base: 'https://jamaica.loopnews.com/',
},
{
    name: 'jamaicagleaner',
    address: 'https://jamaica-gleaner.com/news',
    base: 'https://jamaica-gleaner.com/',
},
{
    name: 'thestar',
    address: 'http://jamaica-star.com/news',
    base: 'http://jamaica-star.com/',
},
{
    name: 'jamaicaobserver',
    address: 'https://www.jamaicaobserver.com/',
    base: 'https://www.jamaicaobserver.com/',
},
];

//stores name, url address and news articles
const dataList = [];

//welcome response
app.get('/', (req, res) => {
    res.json('Welcome to my Jamaican news API');
});

//
collection.forEach(collections => {
    axios.get(collections.address)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);

        $('a:contains("Jamaica")', html).each( function () {
            const name = $(this).text();
            const url = $(this).attr('href');
            dataList.push({
                name,
                url: collections.base + url,
                source: collections.name
            })
        })

    }).catch((error) => {
        console.log(error);
    })
})

//use GET request to scrape websites for API data
app.get('/news', (req, res) => {
    res.json(dataList); 
});

//find newspaper article API data in collection by id
app.get('/news/:collectionId', (req, res) => {
    //find index for each newspaper object
    const newspaperId = req.params.collectionId
    //filter the array to find the newspaper by id using base and address
    const newspaperAddress = collection.filter(newspaper => newspaper.name === newspaperId)[0].address
    const newspaperBase = collection.filter(newspaper => newspaper.name === newspaperId)[0].base

    axios.get(newspaperAddress)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html)
        const selectedArticles = [];

        $('a:contains("Jamaica")', html).each( function () {
            const name = $(this).text();
            const url = $(this).attr('href');
            selectedArticles.push({
                name,
                url: newspaperBase + url,
                source: newspaperId
            })
        })
        res.json(selectedArticles);

    }).catch((error) => {
        console.log(error);
    })
});


app.listen(port, () => {
    console.log(`Node server started on ${port}`);
});