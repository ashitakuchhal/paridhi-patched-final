// Quick syntax/import check — exits 0 if all modules load cleanly
try {
  require("./server/routes/stock");
  require("./server/routes/news");
  require("./server/routes/claude");
  require("./server/lib/yahoo");
  require("./server/lib/indicators");
  console.log("All modules loaded successfully.");
  process.exit(0);
} catch (e) {
  console.error("Module load error:", e.message);
  process.exit(1);
}
