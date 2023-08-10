# Better Connections API
Better connections is a simple API for Better Connections Bot

## Connection available
- Hyakanime
- Deezer

## Installation
1. Clone the repository
```bash
git clone https://github.com/oriionn/better-connections-api.git
```
2. Go to the project directory
```bash
cd better-connections-api
```
3. Install dependencies
```bash
npm install
```
4. Copy the .env.example file and rename it to .env
```bash
cp .env.example .env
```
5. Edit the .env file and fill in the required fields
```dotenv
PORT=3000
AESKEY=zsc5MV834CLAwm6Gj47FrE23pM4buzVi7296AZ3p383M3uZVCHMYd9dWauUccEJ9Y2j8qiUikk2DG8mVB58593K524acY7qC8DivGQbknzWf3Nd227udK2UUpK9yL58w
APIKEY=gVn6vTDz4sfNR2t99Kspm8i9sd436dy4ee5M7Q3Y73Nkz7jvhzTRy226R8433cE3naydjGUsSMN5P6X2hR8cWZ336X75BnUYdQsVpzGuM99zE6F84Am7h3J8yFNSQ2TU
DB_PATH=./db.json

DEEZER_APPID=
DEEZER_SECRET=
DEEZER_REDIRECT_URI=http://localhost:3000/connections/deezer
```
6. Copy db.json.example file and rename it to db.json
```bash
cp db.json.example db.json
```
7. Run the server
```bash
npm start
```

## API Documentation
### GET / 
#### Response
```json 
{
  "status": 200,
  "message": "API is running"
}
```
### GET /getUserKey
#### Query parameters
| Parameters | Type     | Description     |
|------------|----------|-----------------|
| `id`       | `number` | Discord User Id |
| `key`      | `string` | API Key         |
#### Response
```json 
{
  "status": 200,
  "message": "zsc5MV834CLAwm6Gj47FrE23pM4buzVi7296AZ3p383M3uZVCHMYd9dWauUccEJ9Y2j8qiUikk2DG8mVB58593K524acY7qC8DivGQbknzWf3Nd227udK2UUpK9yL58w"
}
```
### GET /connections
#### Query parameters
| Parameters | Type     | Description       |
|------------|----------|-------------------|
| `id`       | `number` | Discord User's Id |
#### Response
```json 
{
  "status": 200,
  "message": { "hyakanime": { "username": "user", "link": "https://hyakanime.fr/profile/user" } }
}
```
### ALL /connections/:connection
#### Body parameters
| Parameters | Type     | Description                     |
|------------|----------|---------------------------------|
| `token`    | `string` | Better connections's user's key |
PS: Other parameters can be required depending on the connection
#### Response
```json 
{
  "status": 200,
  "message": "OK"
}
```
PS: Response depending on the connection

### DELETE /connections/:connection
#### Body parameters
| Parameters | Type     | Description                     |
| `token`    | `string` | Better connections's user's token |

#### Response
```json 
{
  "status": 200,
  "message": "OK"
}
```

### GET /oauth2-link/:connection
#### Connection available
- Deezer
#### Response
```json
{
  "status": 200,
  "message": "(Oauth Link)"
}
```

## Contributors
![Contributors](https://contrib.rocks/image?repo=oriionn/better-connections-api)

## License
[GPL3](https://github.com/oriionn/better-connections-api/blob/main/LICENSE)