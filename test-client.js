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
        // If this was the review response, exit
        else if (response.id === 2 && response.result) {
          console.log("\nReview received:");
          const reviewData = JSON.parse(response.result.content[0].text);
          console.log("Rating:", reviewData.rating);
          console.log("Sentiment:", reviewData.sentiment);
          console.log("Review:", reviewData.review);
          process.exit(0);
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

// Send a review request
function sendReviewRequest() {
  sendRequest("tools/call", {
    name: "getReview",
    arguments: {
      workDescription:
        "Implemented a REST API with full CRUD operations for user management",
      context: "Part of the backend refactoring sprint",
    },
  });
}

// Handle exit
process.on("SIGINT", () => {
  server.kill();
  process.exit(0);
});
