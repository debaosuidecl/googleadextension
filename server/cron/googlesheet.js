const connectDB = require("../config/db");
const googlesheet = require("../helperfunctions/googlesheet");
const delay = (ms)=>{
  return new Promise((resolve,reject)=> {
    setTimeout(()=>{
      resolve("done")
    }, ms)
  })
}
(async () => {
  await delay(5000)
  await connectDB();

  await googlesheet();
  process.exit(1);
})();
