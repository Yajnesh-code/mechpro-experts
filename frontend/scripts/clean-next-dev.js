const fs = require("fs");
const path = require("path");

const nextCachePath = path.join(__dirname, "..", ".next");

fs.rmSync(nextCachePath, { recursive: true, force: true });
console.log("Cleared frontend .next cache.");
