# PharmaMate (Back-End)

PharmaMate is an application designed to offer simplified access to essential medication information, a comprehensive medication timeline, and the ability to add personal health notes alongside medication data. 

## Demo Link
- [PharmaMate Demo](https://youtu.be/paGfftzGDlo) - Explore the functionalities of PharmaMate in this demo.

## Live at
- [PharmaMate](https://pharmamate.onrender.com/) 

## Tech Stack
- **Server:** Node, Express
- **Database:** PostgreSQL

## API used
### Get updated articles
- **Source:** NewsAPI
- **Description:** Fetches updated articles related to drugs, medication, pills, pharma, and medical topics.
- **Endpoint:** `newsapi.v2.everything()`
- **Parameters:**
  - `q`: Query string
  - `language`: Language of the articles
  - `searchIn`: Field to search in
  - `sortBy`: Sorting criterion

### Get drug label
- **Source:** Open FDA API
- **Description:** Retrieves drug label information from the FDA database.
- **Endpoint:** `GET https://api.fda.gov/drug/label.json`
- **Parameters:**
  - `api_key`: Your API key
  - `search`: Search criteria

## Installation
1. **Clone the Repository**
   ```
   git clone https://github.com/pasinee-sb/pharmamate_backend
   ```
2. **Navigate to Project Directory**
   ```
   cd .../pharmamate_backend
   ```
3. **Install NPM Packages**
   ```
   npm i
   ```
4. **Create PostgreSQL Database**
   ```
   createdb pharmamate
   ```

## Run the Application
```
nodemon server.js
```

## Deployment
To deploy this project, run:
```
nodemon server.js
```

## Environment Variables
Add the following environment variables to your `.env` file:
- `NEWS_API_KEY`
- `DRUG_API_KEY`

## Running Tests
Run tests using:
```
npm run test
```

## Troubleshooting Local Run
- **Database Configuration in `config.js`**:
  - Uncomment for testing:
    ```
    "pharmamate_test": process.env.DATABASE_URL || "pharmamate";
    ```
  - Comment for production:
    ```
    "postgresql:///pharmamate_test": process.env.DATABASE_URL || "postgresql:///pharmamate";
    ```
- **Database Connection in `db.js`**:
  - Uncomment for production:
    ```
    if (process.env.NODE_ENV === "production") {
      db = new Client({
        host: "/var/run/postgresql/",
        database: getDatabaseUri(),
        ssl: { rejectUnauthorized: false },
      });
    } else {
      db = new Client({
        host: "/var/run/postgresql/",
        database: getDatabaseUri(),
      });
    }
    ```
  - Comment for local environment:
    ```
    if (process.env.NODE_ENV === "production") {
      db = new Client({
        connectionString: getDatabaseUri(),
        ssl: { rejectUnauthorized: false },
      });
    } else {
      db = new Client({
        connectionString: getDatabaseUri(),
      });
    }
    ```

