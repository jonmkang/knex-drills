require('dotenv').config();
const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')
const { expect } = require('chai');
const { contentSecurityPolicy } = require('helmet');


describe('Shopping List service object', function() {
    let db;
    let exampleList = [
        {
            id: 1,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            item_name: 'Celery',
            price: "1.50",
            category: 'Snack',
            checked: false
        },
        {
            id: 2,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            item_name: 'Lobster Mac',
            price: "21.50",
            category: 'Main',
            checked: false
        },
        {
            id: 3,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            item_name: 'Hot Wings',
            price: "11.50",
            category: 'Lunch',
            checked: false
        }
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    before(() =>  db('shopping_list').truncate())

    afterEach(() => db('shopping_list').truncate())

    after(() => db.destroy())

    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db
                .into('shopping_list')
                .insert(exampleList)
        })

        it(`getShoppingList() resolves the whole list from 'shopping_list' table`, () => {
            return ShoppingListService.getShoppingList(db)
                .then(actual => {
                    expect(actual).to.eql(exampleList.map(item => ({ ...item, date_added: new Date(item.date_added)
                    })))
                })
        })

        it(`getById() gets the correct item by ID from the list`, () => {
            const thirdId = 3
            const thirdItem = exampleList[thirdId - 1]
            return ShoppingListService.getById(db, thirdId)
            .then(actual => {
                expect(actual).to.eql({
                id: thirdId,
                item_name: thirdItem.item_name,
                price: thirdItem.price,
                date_added: thirdItem.date_added,
                checked: thirdItem.checked,
                category: thirdItem.category
                })
            })
        })

        it(`deleteItem() removes the item by id from 'shopping_list' table`, () => {
            const itemId = 3;
            return ShoppingListService.deleteItem(db, itemId)
                .then(() => ShoppingListService.getShoppingList(db))
                .then(allItems => {
                    const expected = exampleList.filter(item => item.id != itemId)
                    expect(allItems).to.eql(expected)
                })
        })

        it(`updateItem() updates the content of an Item by Id from 'shopping_list' table`, () => {
            const updateId = 2;
            const updatedItem = {
                item_name: 'Carrot',
                price: '1.00',
                date_added: new Date (),
                category: 'Lunch',
                checked: true
            }

            return ShoppingListService.updateItem(db, updateId, updatedItem)
                .then(() => ShoppingListService.getById(db, updateId))
                .then(item => {
                    expect(item).to.eql({
                        id: updateId,
                        ...updatedItem,
                    })
                })
        })

    })

    context(`Given 'shopping_list' is empty`, () => {
        it(`getShoppingLIst() resolves an empty array`, () => {{
            return ShoppingListService.getShoppingList(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        }})

        it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
            const newItem = {
                item_name: 'Test item',
                price: '5.00',
                category: 'Snack',
                date_added: new Date('2029-01-22T16:28:32.615Z'),
                checked: false
            }

            return ShoppingListService.insertItem(db, newItem)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        item_name: newItem.item_name,
                        price: newItem.price,
                        date_added: new Date(newItem.date_added),
                        checked: newItem.checked,
                        category: newItem.category
                    })
                })
        })
    })

})