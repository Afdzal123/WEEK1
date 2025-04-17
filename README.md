# 🚗 Ride-Hailing API – Week 4 Exercise

This project is a simple RESTful API for a ride-hailing system developed using Node.js and Express.js. It is part of a use case-driven API design exercise for Week 4.

---

## 📌 Features

- User registration & login (Customer, Driver, Admin)
- Ride request by customer
- Ride acceptance by driver
- Driver availability update
- Admin can block a user

---

## 🚀 Getting Started

### Installation

```bash
npm install
node index.js
```

The server will start on: `http://localhost:3000`

---

## 📂 API Endpoints

| Method | Endpoint                     | Description                     |
|--------|------------------------------|---------------------------------|
| POST   | `/users`                     | Register new user               |
| POST   | `/auth/login`                | User login                      |
| GET    | `/users/:id`                 | View user profile               |
| POST   | `/rides`                     | Customer requests a ride        |
| PATCH  | `/rides/:id/accept`          | Driver accepts ride             |
| PATCH  | `/drivers/:id/status`        | Update driver status            |
| DELETE | `/admin/users/:id`           | Admin blocks a user             |

---

## 🧪 Testing with Postman

A Postman collection is provided to test the API:
- Import the `RideHailingAPI.postman_collection.json` file
- Includes all key endpoints with sample JSON bodies

---

## 🧍 Use Case Diagram

Actors: Customer, Driver, Admin  
Use cases include registration, login, requesting rides, accepting rides, status updates, and admin control.

See `use_case_diagram.png` or `use_case_diagram.drawio` for the visual diagram.

---

## 📁 Folder Structure

```
project-root/
├── index.js
├── README.md
├── use_case_diagram.png
├── RideHailingAPI.postman_collection.json
└── package.json

