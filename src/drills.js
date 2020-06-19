require('dotenv').config();
const knex = require('knex');


const knexInstance = knex({ 
    client: 'pg',
    connection: process.env.DB_URL
})

function searchByTerm(searchTerm) {
    knexInstance
        .select('item_name', 'price', 'date_added', 'checked', 'category')
        .from('shopping_list')
        .where('item_name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            console.log(result)
        })
}

function searchByPageNumber(pageNumber) {
    const productsPerPage = 6
    const offset = productsPerPage*(pageNumber - 1)
    knexInstance
        .select('item_name', 'price', 'date_added', 'checked', 'category')
        .from('shopping_list')
        .limit(productsPerPage)
        .offset(offset)
        .then(result => {
            console.log(result)
        })
}

function searchByDays(daysAgo) {
    knexInstance
    .select('item_name', 'price', 'date_added', 'checked', 'category')
    .where(
        'date_added',
        '>',
        knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
    )
    .from('shopping_list')
    .then(result =>{
        console.log(result)
    })
}

function totalCostByCategory() {
    knexInstance
        .select('category')
        .sum('price as total_price')
        .from('shopping_list')
        .groupBy('category')
        .orderBy([ { column: 'category', order: 'DESC'},
    { column: 'total_price', order: 'ASC'}])
        .then(result => {
            console.log(result)
        })
}

totalCostByCategory()