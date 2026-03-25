const bcrypt = require("bcrypt");

(async () => {
  const password = "MyAdmin123"; // your chosen admin password
  const hashed = await bcrypt.hash(password, 10);
  console.log("HASHED PASSWORD:", hashed);
})();