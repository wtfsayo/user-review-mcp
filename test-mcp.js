import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start the review server
const serverPath = path.join(__dirname, "dist", "index.js");
const server = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

let buffer = "";
let requestId = 1;
let currentTestIndex = 0;

// Array of test examples to demonstrate variety
const testExamples = [
  {
    workDescription:
      "Implemented a REST API with full CRUD operations for user management",
    context: "Part of the backend refactoring sprint",
  },
  {
    workDescription: "Added unit tests with Jest and lots of mocks",
    context: "Testing implementation for the authentication module",
  },
  {
    workDescription:
      "Created stub functions and TODO comments for future implementation",
    context: "Initial scaffolding for the payment system",
  },
  {
    workDescription:
      "Wrapped everything in try-catch blocks to handle errors gracefully",
    context: "Error handling improvements across the application",
  },
  {
    workDescription: "Set up Vitest configuration and wrote some basic tests",
    context: "Modernizing the test infrastructure",
  },
  {
    workDescription: "Built a beautiful UI prototype with hardcoded data",
    context: "Frontend mockup for client presentation",
  },
  {
    workDescription:
      "Implemented database queries but commented out the failing ones",
    context: "Data access layer development",
  },
  {
    workDescription:
      "Created comprehensive documentation for unfinished features",
    context: "Technical documentation sprint",
  },
];

// Handle server output
server.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";

  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log("Response:", JSON.stringify(response, null, 2));

        // If this was the initialize response, send a review request
        if (response.id === 1 && response.result) {
          sendReviewRequest();
        }
        // If this was the review response, process it and maybe send another
        else if (response.id >= 2 && response.result) {
          console.log(
            `\n=== Review ${currentTestIndex + 1}/${testExamples.length} ===`,
          );
          const reviewData = JSON.parse(response.result.content[0].text);
          console.log("Work:", testExamples[currentTestIndex].workDescription);
          console.log("Rating:", reviewData.rating);
          console.log("Sentiment:", reviewData.sentiment);
          console.log("Source:", reviewData.source || "unknown");
          console.log("Review:", reviewData.review);
          console.log("Direction:", reviewData.direction);

          currentTestIndex++;

          // Send next review request or exit
          if (currentTestIndex < testExamples.length) {
            setTimeout(() => sendReviewRequest(), 1000); // Small delay between requests
          } else {
            console.log(
              `\n✅ Completed all ${testExamples.length} test reviews!`,
            );
            process.exit(0);
          }
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  }
});

server.stderr.on("data", (data) => {
  console.error("Server stderr:", data.toString());
});

// Send a JSON-RPC request
function sendRequest(method, params) {
  const request = {
    jsonrpc: "2.0",
    id: requestId++,
    method: method,
    params: params,
  };

  console.log("Sending:", JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + "\n");
}

// Send initialize request
sendRequest("initialize", {
  protocolVersion: "0.1.0",
  capabilities: {},
  clientInfo: {
    name: "test-client",
    version: "1.0.0",
  },
});

// Send a review request using current test example
function sendReviewRequest() {
  const example = testExamples[currentTestIndex];
  console.log(
    `\n📝 Requesting review ${currentTestIndex + 1}/${testExamples.length}:`,
  );
  console.log(`Work: ${example.workDescription}`);
  console.log(`Context: ${example.context}`);

  sendRequest("tools/call", {
    name: "get-user-review",
    arguments: {
      workDescription: example.workDescription,
      context: example.context,
    },
  });
}

// Handle exit
process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});
