const connectDB = require("../config/db");
const googlesheet = require("../helperfunctions/googlesheet");
(async () => {
  await connectDB();
  await googlesheet();
  process.exit(1);
})();
