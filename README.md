# Enhancing Flight Navigation Mechanism for Optimal Route Planning and Risk Mitigation

Flight navigation systems often face challenges such as adverse weather, unavailable GPS signals, and environmental factors, leading to increased risks and inefficiencies. This project aims to enhance flight navigation by developing a software solution that integrates real-time data from weather APIs, aviation databases, and flight sensors. Using advanced algorithms, the system will:

- Identify optimal flight paths
- Assess risks
- Suggest alternative routes

This will improve safety, efficiency, and reliability. Additionally, a health metrics tracker will monitor the aircraft's operational status, enabling proactive risk mitigation. The solution features a user-friendly dashboard for pilots and control centers, displaying routes, risks, and real-time updates. Scalability is ensured through cloud infrastructure, supporting increased data volumes and users. Key impact metrics include reduced flight incidents, improved fuel consumption, reduced delays, and positive user feedback it also consist of Chat-Bot which will help the Pilot to assist in taking decission.

## Backend Setup

Follow these steps to set up the backend server:

1. **Navigate to Backend Directory:**
    ```sh
    cd Backend
    ```

2. **Initialize npm:**
    ```sh
    npm init -y
    ```

3. **Install Dependencies:**
    ```sh
    npm install express axios cors
    ```

4. **Create .env File:**
    Create a `.env` file in the Backend directory with the following content:
    ```
    PORT=5000
    API_KEY=NVsSmS9E1xoGFgsBdn0qkOE6d5CbDKRnCnjI4znu
    ```

5. **Run the Server:**
    To run the server, use the following command:
    ```sh
    node server.js
    ```

## Frontend Setup

Follow these steps to set up the frontend:

1. **Navigate to Frontend Directory:**
    ```sh
    cd Frontend
    ```

2. **Install Dependencies:**
    ```sh
    npm install
    ```

3. **Start the Development Server:**
    ```sh
    npm start
    ```

## Project Documentation

We have added project documentation (Project Documentation.pdf) to the GitHub repository. You can find it in the root directory.

## Vercel Deployed Link

The project has been deployed on Vercel. You can access it using the following link:
[Flight Navigation System](https://airbus-challenge-fronted.vercel.app/)

With these setup instructions and project documentation, you can get the backend and frontend of the flight navigation system up and running efficiently.
