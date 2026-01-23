const express = require("express");
const cors = require("cors");
const db = require("./db/db"); 


const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const httpLogger = require("../src/modules/utils/logger");

app.use(httpLogger);


const auth = require("./modules/middleware/auth.middleware");

const authModule = require("./modules/auth/auth.controller");
authModule.setupRoutes(app); 


const userModule = require("./modules/users/user.controller");
userModule.setupRoutes(app);



const adminModule = require("./modules/admin/admin.controller");
adminModule.setupRoutes(app,auth);

const categoryRoutes = require("./modules/category/category.controller");
categoryRoutes.setupRoutes(app,auth);

const locationRoutes = require("./modules/location/location.controller");
locationRoutes.setupRoutes(app,auth);

const issueModule  = require("./modules/issue/issue.controller")
issueModule.setupRoutes(app);



// Start server (PORT from env or 5000)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});



