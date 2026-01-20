const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./db/db"); 


// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const httpLogger = require("./modules/utils/logger");

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
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


