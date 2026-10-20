console.log("=== Async Execution Lab ===");

console.log("1. Program started");

setTimeout(() => {
  console.log("4. Timer 0ms callback executed");
}, 0);

setTimeout(() => {
  console.log("6. Timer 1000ms callback executed");
}, 1000);

console.log("2. JavaScript continues");

for (let i = 0; i < 3; i++) {
  console.log(`3.${i + 1} Synchronous task ${i + 1}`);
}

setTimeout(() => {
  console.log("5. Second 0ms timer executed");
}, 0);

console.log("3. Synchronous code finished");