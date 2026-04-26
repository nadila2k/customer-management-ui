# Customer Management UI

A React-based frontend application for managing customers. This UI connects with the Customer Management API and provides features like customer CRUD operations, bulk upload via Excel, and validation feedback.

---

## Prerequisites

Before running the application, make sure you have installed:

* Node.js (v16 or higher recommended)
* npm or yarn

---

## Installation

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the root directory and configure the API base URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Make sure this URL matches your backend API.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will run on:

```
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## Features

* Customer create, update, delete, and view
* Bulk upload using Excel files
* Error handling and validation feedback
* Toast notifications for user actions
* Routing using React Router

---

## Excel Files

Sample Excel files are available in the `assets` folder:

* Insert data file
* Update data file
* Update with errors file

These files can be used to test bulk upload functionality and validation handling.

- Excel upload depends on correct file format; use provided samples.
- Follow this order when uploading Excel files:
  - Bulk Data INSERT  
  - Updating Customer Records Via Excel  
  - Updated_Customer_Records_Errors

---

## Technologies Used

* React 19
* Vite
* Material UI (MUI)
* Axios
* React Router DOM
* React Toastify
* ESLint

---

## Notes

* Ensure the backend API is running before starting the UI.
* Update the `.env` file if your backend URL changes.
* Excel upload depends on correct file format; use provided samples.

---
