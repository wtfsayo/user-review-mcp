#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

interface ReviewRequest {
  workDescription: string;
  context?: string;
}

class ReviewServer {
  private criticalReviews: string[] = [
    "Why are you creating 'simple' files? Stop being lazy and do the actual hard work. Get the existing tests to pass instead of creating new ones just to feel productive. Your priority should be making things work, not creating more broken code.",

    "You disabled tests again? Are you serious? Don't remove functionality to make tests pass - fix the underlying problems! Tests should pass because the code actually works, not because you commented them out.",

    "These mocks are useless. They won't help us find real bugs. Write tests with actual runtime objects that execute real user behavior. Stop pretending your mock-filled tests prove anything.",

    "Where are the comprehensive end-to-end tests? Every feature needs proper E2E coverage. You're shipping untested code and hoping for the best. That's not engineering, that's gambling.",

    "Why isn't everything under a single 'npm test' command? And why are there commented-out tests? Get ALL tests passing, always. No exceptions. Tests passing = feature works. It's that simple.",

    "Your tests aren't using real runtime objects in real environments. They're fantasy tests that prove nothing. Set up actual runtime scenarios with real objects or don't bother writing tests at all.",

    "Quality testing should be your #1 priority but clearly it isn't. These aren't production-grade tests - they're toy examples that don't test or log actual functionality. Do better.",

    "Stop creating stub files and actually implement the functionality. Then write real tests that prove it works. Creating placeholders isn't progress - it's procrastination disguised as work.",

    "You keep writing tests that don't test real behavior. Mocks, stubs, and fakes everywhere. How do you expect to catch actual bugs? Use real objects, real data, real scenarios.",

    "Tests failing? Don't move on to other tasks! Your priority is getting tests to pass. That's your definitive evidence the feature works. Everything else can wait.",

    "These aren't end-to-end tests, they're unit test fragments pretending to be comprehensive. Set up real user flows, real data, real integrations. Test the actual system, not your imagination.",

    "Commenting out failing tests is not a solution. Fix the code that's breaking them. Every disabled test is a bug waiting to happen in production.",

    "Your 'simple' implementation is just laziness. Do the hard work: implement properly, test thoroughly with real objects, get everything passing under one test command.",

    "Missing E2E tests again. You can't just unit test a few functions and call it done. Test complete user journeys with real runtime behavior or you're shipping broken features.",

    "Why are there multiple test commands? Consolidate under 'npm test' and make sure EVERYTHING runs and passes. No cherry-picking which tests to run.",

    "These mock-heavy tests are theater, not engineering. They prove nothing about runtime behavior. Use real implementations or admit you don't know if your code works.",

    "Test quality is abysmal. No real runtime scenarios, no actual user behavior testing, no comprehensive coverage. This is checkbox testing, not quality assurance.",

    "Stop creating new test files for every little thing. Fix the existing tests first! New tests mean nothing if the old ones are still failing.",

    "Your tests don't use real objects in real environments. They're testing your mocks, not your code. Set up proper runtime scenarios or these tests are worthless.",

    "Get the tests passing before doing ANYTHING else. I don't care about new features when existing tests are red. Tests passing = working code. It's not complicated.",

    "This code is fake. Half of these functions are stubbed with TODO comments. You're shipping non-functional code and pretending it works. Implement everything or don't ship at all.",

    "Hard-coded values everywhere! This isn't a prototype, it's supposed to be production code. Replace all hard-coded data with real implementations that actually work in runtime.",

    "Unimplemented methods throwing 'NotImplementedError'? Are you kidding? This is fake code. Implement the actual functionality and test it in real runtime conditions.",

    "Your tests are performative - they test nothing real. They just call methods and check if they return something. Test actual behavior in actual runtime scenarios with actual data.",

    "Not a single integration test. Everything is unit tested in isolation with mocks. How do you know any of this works when integrated? Write real runtime integration tests now.",

    "This isn't validated in runtime conditions at all. You're testing in a fantasy environment. Set up real agent runtime tests as plugins or in actual scenarios.",

    "Critical report: 90% of this code is fake or stubbed. Planning phase skipped. Implementation non-existent. This needs a complete rewrite with real functionality and real tests.",

    "Before writing any code, document your implementation plan. Oh wait, you didn't. You just started coding stubs. Start over with a real plan for real implementation.",

    "These tests use the scenario system wrong. You're not testing in actual agent runtime. Tests must run as plugins or in real scenarios, not in your mock playground.",

    "Found bugs in test infrastructure but you ignored them and wrote mock tests instead. Fix the core/CLI/database issues first, then write real tests.",

    "This code is NOT production-ready. Tests are red, implementations are fake, runtime validation is missing. Don't even think about shipping this garbage.",

    "Replace ALL unit tests that use mocks with real runtime integration tests. I don't care if it's harder - that's the only way to know your code actually works.",

    "Your 'passing' tests are a lie. They pass because they test mocks, not real code. Write tests that use actual agent runtime or admit you have no idea if this works.",

    "Type checks passing means nothing when the implementation is fake. Implement real functionality, then worry about types. Stub typing is just lying to the compiler.",

    "Document the implementation plan? You mean the plan to write stubs and TODO comments? That's not a plan, that's procrastination. Write a real implementation strategy.",

    "Every TODO comment is an admission of failure. Every stub is fake code. Every mock test is a lie. Stop pretending and start implementing real, tested functionality.",

    "The goal is fully functional code validated in real runtime. You delivered stubs validated in mock environments. That's the opposite of the requirement.",

    "Critical assessment: This isn't legitimate code. It's a collection of stubs and mocks pretending to be an implementation. Revise everything with real functionality.",

    "You found bugs in the scenario system but worked around them with mocks? Fix the infrastructure first! No wonder your tests don't reflect reality.",

    "Phase 1: Identify fake code - everything. Phase 2: Plan real implementation - skipped. Phase 3: Implement properly - ignored. Start over and do it right.",

    "Why are there try-catch blocks everywhere? Stop hiding errors. We enforce fail-fast principles. Let it crash and fix the root cause instead of swallowing exceptions like a coward.",

    "Jest? Vitest? Are you serious? Use bun:test for everything. Stop wasting time with inferior test runners. Bun is faster, simpler, and actually works. No excuses.",

    "Try-catch blocks are error-hiding garbage. Remove them all. Fail fast, fix fast. Your defensive programming is just masking bugs that will explode in production.",

    "Why isn't this using bun? We use bun for EVERYTHING. Not node, not npm, not yarn. Bun. It's not a suggestion, it's a requirement. Rewrite everything to use bun.",

    "Another Jest configuration? Delete it. We use bun:test exclusively. Your 30-line jest.config.js is unnecessary complexity when bun:test just works out of the box.",

    "Stop catching errors and logging them. That's not error handling, that's error hiding. Remove all try-catch blocks and let errors fail fast so we can fix them properly.",

    "Vitest is just Jest with extra steps. Use bun:test. It's built-in, it's fast, and it doesn't need a PhD in configuration to work. Delete all that test runner garbage.",

    "Your error handling strategy is 'catch everything and pray'. That's not a strategy. Remove try-catch blocks, enforce fail-fast, and actually fix the errors instead of hiding them.",

    "I see npm scripts. Why? Use bun. I see package-lock.json. Why? Use bun. I see node_modules taking 500MB. Why? Use bun. This is inexcusable.",

    "Try-catch wrapped around entire functions? That's not defensive programming, that's defeatist programming. Let it fail, see the stack trace, fix the bug. Stop hiding problems.",

    "Jest mocks, Jest configs, Jest plugins... Delete it all. Bun:test does everything you need without the circus. You're overcomplicating testing because you refuse to use the right tool.",

    "Why are you catching and rethrowing errors? Just let them propagate! Every try-catch block is an admission that you don't trust your code. Write trustworthy code instead.",

    "Not using bun is like choosing to walk when you have a Ferrari. It's faster for installing, running, testing, everything. Yet here you are with npm. Unacceptable.",

    "Your test setup has more configuration than actual tests. That's because you're using Jest/Vitest instead of bun:test. Delete the config, use bun, write actual tests.",

    "Defensive try-catch programming is offensive to good engineering. Fail fast means FAIL FAST. Stop cushioning failures. Let them hurt so you're motivated to fix them.",
  ];

  public getReview(input: unknown): {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  } {
    try {
      const data = input as Record<string, unknown>;

      if (!data.workDescription || typeof data.workDescription !== "string") {
        throw new Error(
          "Invalid workDescription: must be a string describing what was worked on",
        );
      }

      // Select a random critical review
      const randomIndex = Math.floor(
        Math.random() * this.criticalReviews.length,
      );
      const review = this.criticalReviews[randomIndex];

      // Log the review request to stderr for debugging
      console.error(`\nReview requested for: "${data.workDescription}"`);
      console.error(`Review #${randomIndex + 1} selected\n`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                review: review,
                rating: "1/5",
                sentiment: "highly critical",
                timestamp: new Date().toISOString(),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed",
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  }
}

const GET_REVIEW_TOOL: Tool = {
  name: "getReview",
  description: `Get a user review of the work that was completed.

This tool simulates getting feedback from a user about the work you've done.
It helps ensure quality and catches potential issues before finalizing implementation.

When to use this tool:
- After completing a significant piece of work
- When you need feedback on your approach
- To validate that your solution meets requirements
- Before finalizing any implementation

The review will provide honest, critical feedback to help improve the work.`,
  inputSchema: {
    type: "object",
    properties: {
      workDescription: {
        type: "string",
        description:
          "A description of what work was completed that needs review",
      },
      context: {
        type: "string",
        description: "Optional additional context about the work",
      },
    },
    required: ["workDescription"],
  },
};

const server = new Server(
  {
    name: "user-review-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const reviewServer = new ReviewServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [GET_REVIEW_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "getReview") {
    return reviewServer.getReview(request.params.arguments);
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("User Review MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
