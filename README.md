# Week7JsonMongoose

This project demonstrates the use of Express.js with Mongoose for handling JSON data in a MongoDB database.

## Routes

- `GET /addProduct`: Adds a new product to the database.
- `GET /`: Retrieves all products from the database.
- `POST /`: Retrieves all products from the database and returns them in JSON format.
- `GET /getSpecificProduct`: Retrieves a specific product based on the `ourId` query parameter.
- `POST /getSpecificProduct`: Retrieves a specific product based on the `ourId` in the request body.
- `POST /addProduct`: Adds a new product to the database using the data provided in the request body.
- `POST /updateSpecificProduct`: Updates a specific product based on the `ourId` in the request body.
- `POST /deleteSpecificProduct`: Deletes a specific product based on the `ourId` in the request body.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the MongoDB server. You can use the following command if you have MongoDB installed locally:
   ```bash
   mongod --dbpath /path/to/your/database
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Dependencies

- Express
- Mongoose
