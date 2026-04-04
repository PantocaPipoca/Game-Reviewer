# Routes Info

## Users

- POST /api/users
- POST /api/users/login
- POST /api/users/logout
- GET /api/users/me
- PUT /api/users/me
- DELETE /api/users/me
- GET /api/users/search?query=...
- GET /api/users/:username

## Followers

- GET /api/users/:username/followers
- POST /api/users/:username/followers
- DELETE /api/users/:username/followers
- GET /api/users/:username/following
- GET /api/users/me/followers/requests/received
- GET /api/users/me/followers/requests/sent
- PUT /api/users/me/followers/requests/received/:username
- DELETE /api/users/me/followers/requests/received/:username

## Games

- GET /api/games/id/:gameID
- POST /api/games/search
- POST /api/games/popular
- POST /api/games/recent
- POST /api/games/recommended

## Reviews

- GET /api/reviews/:reviewer/:reviewed
- GET /api/games/:gameID/reviews
- POST /api/games/:gameID/reviews
- PUT /api/games/:gameID/reviews
- DELETE /api/games/:gameID/reviews
- GET /api/users/:username/reviews

## Comments

- GET /api/reviews/:reviewer/:reviewed/comments
- POST /api/reviews/:reviewer/:reviewed/comments
- PUT /api/reviews/:reviewer/:reviewed/comments/:id
- DELETE /api/reviews/:reviewer/:reviewed/comments/:id

## Reactions

- GET /api/reviews/:reviewer/:reviewed/likes
- POST /api/reviews/:reviewer/:reviewed/likes
- GET /api/reviews/:reviewer/:reviewed/dislikes
- POST /api/reviews/:reviewer/:reviewed/dislikes
- DELETE /api/reviews/:reviewer/:reviewed/reacts
