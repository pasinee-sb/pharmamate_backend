
# PharmaMate (Back-End)

A simplified access to vital medication information, a comprehensive medication timeline and the ability to add personal health notes alongside medications


## Demo Link
 [PharmaMate Demo](https://youtu.be/paGfftzGDlo)

## Live at
[PharmaMate](https://pharmamate.onrender.com/)


## Tech Stack

**Server:** Node, Express 
**Database:** PostgreSQL


## API used

#### Get updated articles


[NewsAPI](https://newsapi.org/docs/endpoints/everything)

```http
const drugAPI = process.env.DRUG_API_KEY;
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);
  newsapi.v2.everything({
      q: "drug OR medication OR pill OR pharma OR medical",
      language: "en",
      searchIn: "title",
      sortBy: "publishedAt",
    });
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get drug label

[Open FDA API](https://open.fda.gov/apis/drug/label/how-to-use-the-endpoint/)


```http
GET https://api.fda.gov/drug/label.json?api_key=${drugAPI}&search=
ENDPOINT openfda.generic_name.exact:"${encodedDrug}"  and
ENDPOINT openfda.brand_name.exact:"${encodedDrug}"
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `drugAPI`      | `string` | **Required**.  Your API key |
| `encodedDrug`      | `string` | **Required**.  |




## Installation


Clone the repository to your local machine using the command  
```bash 
    git clone https://github.com/pasinee-sb/pharmamate_backend
  ```

Navigate to the project directory.
```bash 
    cd .../pharmamate_backend
```

Install the required npm packages using  
```bash 
    npm i
  ```
Create a PostgreSQL database for the project.
```bash 
    createdb pharmamate
  ```
Run the application
```bash 
    nodemon server.js
  ```
## Deployment

To deploy this project run 

```bash
  nodemon server.js
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NEWS_API_KEY` 

`DRUG_API_KEY`




## Running Tests

To run tests, run the following command

```bash
  npm run test
```


## If there is any trouble running locally

Access config.js  uncomment text below

```bash
    "pharmamate_test"
    : process.env.DATABASE_URL || "pharmamate";
```
And comment text below

```bash
  "postgresql:///pharmamate_test"
 : process.env.DATABASE_URL || "postgresql:///pharmamate";
```

Access db.js  uncomment text below

```bash

if (process.env.NODE_ENV === "production") {
  db = new Client({
    host: "/var/run/postgresql/",
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  }); } else {
db = new Client({
   host: "/var/run/postgresql/",
   database: getDatabaseUri(),
 }); }
```
And comment text below

```bash
  
if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}
```
