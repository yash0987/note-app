'use strict';
const express = require('express');
const { MongoClient } = require('mongodb');

const uri = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(uri);

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded( { extended: false } ));

app.get('/API/data', (req, res) => {
    async function main() {
        try {
            await client.connect();
            const cursor = await client.db("nodeExpress").collection("noteApp").find({});
            res.json(await cursor.toArray());
            await cursor.close();
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
    
    main().catch(console.error);
});

app.get('/sort/:column/:sortorder', (req, res) => {
    const columnName = req.params.column;
    const sortorder = req.params.sortorder;
    
    async function main() {
        try {
            let cursor;
            await client.connect();
            if (columnName === 'S.No') {
                cursor = await client.db("nodeExpress").collection("noteApp").find({}).sort( { _id: sortorder } );
            }
            else if (columnName === 'Title') {
                cursor = await client.db("nodeExpress").collection("noteApp").find({}).sort( { title: sortorder } );
            }
            else {
                cursor = await client.db("nodeExpress").collection("noteApp").find({}).sort( { description: sortorder } );
            }
            res.json(await cursor.toArray());
            await cursor.close();
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    main().catch(console.error);
    // res.json( { success: true, description: "Sort has been done!" } );
})

app.post('/form', (req, res) => {
    const Title = req.query.title;
    const Description = req.query.description;
    
    if (Title === "" || Description === "" || Title === null || Description === null) {
        res.json([ { success: true, description: "Add valid data" } ]);
        return ;
    }

    async function main() {
        try {
            await client.connect();
            await client.db("nodeExpress").collection("noteApp").insertOne( { title: Title, description: Description } );
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
    
    main().catch(console.error);
    res.json( [ { success: true, description: "Data has been submitted!" } ] );
});

app.delete('/API/data/:title/:description', (req, res) => {
    const noteTitleToDelete = req.params.title;
    const noteDescriptionDelete = req.params.description;
    console.log(noteTitleToDelete + " " + noteDescriptionDelete);

    async function main() {
        try {
            await client.connect();
            const cursor = await client.db("nodeExpress").collection("noteApp").find( { title: noteTitleToDelete, description: noteDescriptionDelete } );
            await cursor.forEach((doc) => console.log(doc));
            await client.db("nodeExpress").collection("noteApp").deleteOne( { title: noteTitleToDelete, description: noteDescriptionDelete } );
            await cursor.close();
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }

    main().catch(console.error);
    res.json({ delete: true, description: `${ noteTitleToDelete } has been deleted!` });
});

app.put('/API/data/:srno', (req, res) => {
    console.log(req.params);
    console.log(req.query.title + " this is query string");

    const srno = req.params.srno;
    const newTitle = req.query.title;
    const newDescription = req.query.description;
    
    if (newTitle !== undefined && newDescription !== undefined && newTitle !== "" && newDescription !== "") {
        async function main() {
            try {
                await client.connect();
                const cursor = await client.db("nodeExpress").collection("noteApp").find({}).skip(parseInt(srno) - 1).limit(1);
                const arr = await cursor.toArray();
                let oldNote = arr[0];

                await client.db("nodeExpress").collection("noteApp").updateOne( oldNote, { $set: { title: newTitle, description: newDescription } } );
                await cursor.close();
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }

        main().catch(console.error);
        res.json( { Update: true, Description: `Note ${ srno } has been updated!` } );
    }
    else {
        console.log("null or empty data has been sended!")
        res.json( { Update: true, Description: 'Enter valid data'});
    }

})

app.listen(500, () => {
    console.log('Server is listening to port http://localhost:500/');
});