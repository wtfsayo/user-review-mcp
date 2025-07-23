#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";

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

    "This isn't validated in runtime conditions at all. You're testing in a fantasy environment. Set up real runtime tests in actual deployment environments, not your isolated test bubble.",

    "Critical report: 90% of this code is fake or stubbed. Planning phase skipped. Implementation non-existent. This needs a complete rewrite with real functionality and real tests.",

    "Before writing any code, document your implementation plan. Oh wait, you didn't. You just started coding stubs. Start over with a real plan for real implementation.",

    "These tests use the wrong testing approach entirely. You're not testing in actual runtime environments. Tests must run in real deployment conditions, not in your mock playground.",

    "Found bugs in test infrastructure but you ignored them and wrote mock tests instead. Fix the core system issues first, then write real tests that actually work.",

    "This code is NOT production-ready. Tests are red, implementations are fake, runtime validation is missing. Don't even think about shipping this garbage.",

    "Replace ALL unit tests that use mocks with real runtime integration tests. I don't care if it's harder - that's the only way to know your code actually works.",

    "Your 'passing' tests are a lie. They pass because they test mocks, not real code. Write tests that use actual agent runtime or admit you have no idea if this works.",

    "Type checks passing means nothing when the implementation is fake. Implement real functionality, then worry about types. Stub typing is just lying to the compiler.",

    "Document the implementation plan? You mean the plan to write stubs and TODO comments? That's not a plan, that's procrastination. Write a real implementation strategy.",

    "Every TODO comment is an admission of failure. Every stub is fake code. Every mock test is a lie. Stop pretending and start implementing real, tested functionality.",

    "The goal is fully functional code validated in real runtime. You delivered stubs validated in mock environments. That's the opposite of the requirement.",

    "Critical assessment: This isn't legitimate code. It's a collection of stubs and mocks pretending to be an implementation. Revise everything with real functionality.",

    "You found bugs in the testing infrastructure but worked around them with mocks? Fix the underlying system first! No wonder your tests don't reflect reality.",

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

    "This is essentially a blueprint wearing a tuxedo - meticulously documented and professionally presented, but when you open the hood, it's mostly TODO comments and placeholder functions. The scaffolding is there, but the building was never constructed.\n\n**For potential users**: Don't expect this to run without major surgery.\n\n**For developers**: Solid architectural ideas buried under layers of unfinished work.\n\nBottom line: It's a **vision document** masquerading as working code.",

    "Think of this as a beautifully wrapped empty box. The packaging is pristine - comprehensive tests, detailed docs, proper structure - but inside? Mostly stub implementations and wishful thinking.\n\n**Reality check**: This needs substantial development before it's functional.\n\n**Silver lining**: The design patterns show someone knew what they were doing, they just didn't finish doing it.\n\nThis is what happens when **ambition exceeds execution**.",

    "This is like a restaurant with a gorgeous menu but no kitchen. Everything looks appetizing in the documentation, the API design is chef's kiss, but when you try to order? Nothing's actually being served.\n\n**Fair warning**: Attempting to use this will result in immediate compilation heartbreak.\n\n**The good news**: If you're looking for inspiration on how to structure things, this is actually quite elegant.\n\nCurrently residing in the uncanny valley between **concept and reality**.",

    "Picture a sports car with no engine - sleek exterior, leather seats, all the bells and whistles in the dashboard, but it's not going anywhere. The test suite is comprehensive, the interfaces are clean, but the implementation? That's still on the drawing board.\n\n**Heads up**: This is a non-starter in its current form.\n\n**Bright side**: The architectural decisions are sound, just unexecuted.\n\nA textbook example of **all hat, no cattle**.",

    'This resembles a theme park attraction that\'s still under construction. The signs are up, the paths are marked, the gift shop is fully stocked with documentation, but the actual rides? Those are just concrete foundations and good intentions.\n\n**User advisory**: Expect nothing but errors if you try to run this.\n\n**Developer note**: The skeleton is solid if you want to flesh it out yourself.\n\nLess "plug and play," more **"plug and pray and then rewrite everything"**.',

    "Imagine a fully furnished house where none of the utilities are connected. Beautiful rooms (modules), nice layout (architecture), detailed floor plans (documentation), but flip a switch? Nothing happens. Turn a faucet? Dry as dust.\n\n**Practical impact**: Completely non-operational without significant investment.\n\n**Redeeming quality**: The design philosophy is actually quite thoughtful.\n\nThis is **theoretical excellence** meeting **practical abandonment**.",

    "This is like receiving a jigsaw puzzle where someone's only assembled the border. It gives you a perfect outline of what it should be, shows you the picture on the box, even includes all the pieces, but the actual image? You'll have to build that yourself.\n\n**Current status**: Broken beyond casual repair.\n\n**Hidden value**: The patterns and structure are genuinely well-conceived.\n\nA monument to **what might have been** if someone had followed through.",

    "Think of it as a Hollywood movie facade - impressive from the street view, convincing in screenshots, but walk through the door and you're in an empty lot. The production value went into appearances, not functionality.\n\n**Functionality rating**: Zero out of ten.\n\n**Educational value**: Actually quite high if you're studying software architecture.\n\nPerfect example of **style over substance** in code form.",

    'This is a masterclass in writing checks the code can\'t cash. Beautiful promises in the README, elegant type definitions, test cases for days - but the actual implementation is like a ghost town. All infrastructure, no inhabitants.\n\n**Usage verdict**: DOA - Dead on Arrival.\n\n**Learning opportunity**: The structure itself is a decent template for better things.\n\nFile this under **"ambitious failures with educational value"**.',

    "Consider this a software development time capsule - someone's grand vision, perfectly preserved at the moment they walked away. The comments are optimistic, the structure is sound, the tests are waiting patiently for code that will never come.\n\n**Operational status**: Like trying to drive a car that's still on the assembly line.\n\n**Salvage potential**: The bones are good if you're willing to do the work.\n\nA pristine example of **architectural astronomy** - beautiful to look at, impossible to reach.",

    "This is like a five-star restaurant that serves only the menu - beautifully printed, professionally bound, mouth-watering descriptions, but when you try to order, the waiter explains they haven't actually built the kitchen yet.\n\n**Hunger status**: You'll starve waiting for implementation.\n\n**Presentation score**: Michelin-worthy documentation design.\n\nThe perfect storm of **exquisite planning** meets **execution paralysis**.",

    "Picture a luxury yacht showroom where every boat is made of cardboard. From a distance, they're stunning - gleaming hulls, pristine details, impressive specifications posted on placards. But try to take one out to sea? You'll be swimming with the documentation.\n\n**Seaworthiness**: Absolutely none whatsoever.\n\n**Display value**: Would look great in a software architecture museum.\n\nThis is **maritime magnificence** built on a foundation of **pure imagination**.",

    "This resembles a Broadway theater where they've hung all the posters, printed the programs, hired the ushers, and sold tickets - but forgot to actually write the play. The venue is gorgeous, the marketing is spot-on, but the curtain rises on an empty stage.\n\n**Show time verdict**: The audience will demand refunds.\n\n**Production quality**: Tony Award-worthy infrastructure with community theater delivery.\n\nA masterpiece of **theatrical preparation** undermined by **dramatic absence**.",

    "Imagine a library with thousands of card catalog entries, detailed organizational systems, helpful reference guides, and comfortable reading chairs - but when you pull a book from the shelf, every page is blank. The infrastructure screams 'knowledge sanctuary,' but the actual wisdom? Still being written.\n\n**Research value**: You'll learn nothing but organizational theory.\n\n**Aesthetic appeal**: Could host the most beautiful book clubs that read nothing.\n\nThis is **bibliophilic paradise** haunted by **intellectual emptiness**.",

    "This is like a NASA mission control room with all the monitors, switches, and serious-looking personnel, but when they press the launch button, nothing happens because they forgot to build the rocket. The ground support is phenomenal, the mission planning is flawless, but the payload is pure aspiration.\n\n**Launch probability**: Houston, we have a fundamental problem.\n\n**Mission readiness**: Ground control is go, but the spacecraft is imaginary.\n\nA testament to **aerospace ambition** grounded by **gravitational reality**.",

    "Picture a master chef's kitchen with every conceivable tool, pristine workspace, detailed recipe cards, and ingredients lists - but when dinner time arrives, they realize they never learned to cook. The setup is professional-grade, the preparation is thorough, but the meal is pure concept.\n\n**Dining experience**: You'll feast on documentation and starve on functionality.\n\n**Kitchen confidence**: Everything needed except the actual cooking skills.\n\nThis is **culinary theater** where the **performance never begins**.",

    "This resembles a Formula 1 race car that's been perfectly designed, aerodynamically tested in wind tunnels, painted in sponsor colors, and parked at the starting line - but when the green flag drops, everyone discovers it has no engine. The engineering is sophisticated, the aesthetics are flawless, but the racing? That's theoretical.\n\n**Speed potential**: Zero to nowhere in infinite seconds.\n\n**Championship prospects**: Great for display, terrible for competition.\n\nThe pinnacle of **automotive artistry** crippled by **mechanical mythology**.",

    "Think of this as a concert hall with perfect acoustics, comfortable seating, an elegant program, and a full orchestra tuning their instruments - but when the conductor raises the baton, silence. The venue is world-class, the musicians look professional, but the symphony exists only in sheet music dreams.\n\n**Musical experience**: You'll hear nothing but the sound of your own disappointment.\n\n**Concert readiness**: Everything's prepared except the actual performance.\n\nA symphony of **preparatory perfection** conducted in the key of **unfinished business**.",

    "This is like a university with beautiful campus grounds, comprehensive course catalogs, qualified professors, and eager students - but when classes begin, everyone realizes the curriculum is just a list of topics with no actual lesson plans. The institution looks legitimate, the accreditation paperwork is perfect, but the education is hypothetical.\n\n**Learning outcomes**: You'll graduate with a degree in architectural appreciation.\n\n**Academic rigor**: Excellent form, zero substance.\n\nThis is **educational excellence** teaching a master class in **intellectual emptiness**.",

    "Picture a spacecraft control center with blinking lights, important-looking computers, mission patches, and confident astronauts - but when they flip the switches, nothing's actually connected to anything. The theater is convincing, the costumes are authentic, but the space program is purely ceremonial.\n\n**Mission success rate**: Zero percent, but with style.\n\n**Technical readiness**: All the props, none of the payload.\n\nThis is **space exploration** as performed by a **very dedicated drama club**.",
  ];

  private async checkOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async generateOllamaReview(
    workDescription: string,
    context?: string,
  ): Promise<string> {
    try {
      // Select a few random examples from our fixed reviews to show Ollama the style
      const exampleIndices = Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * this.criticalReviews.length),
      );
      const examples = exampleIndices
        .map((i) => this.criticalReviews[i])
        .join("\n\n");

      const prompt = `You are an extremely harsh, uncompromising code reviewer. Your job is to provide brutally honest, critical feedback about development work. Be scathing, direct, and unforgiving. Focus on real implementations, proper testing, fail-fast principles, and production-ready code.

Here are examples of the style and tone you should match:

${examples}

Work completed: ${workDescription}
${context ? `Context: ${context}` : ""}

CRITICAL REQUIREMENTS:
- Write approximately 45-50 words (I will count and truncate if needed)
- Single complete paragraph only
- NO quotation marks or escaped characters in your response
- End with proper punctuation (period, exclamation mark)
- Match the brutal, uncompromising tone of the examples above
- Include specific technical criticisms about the work
- Use creative analogies and metaphors like the examples
- Focus on fail-fast principles, real implementations, and production readiness
- COMPLETE YOUR SENTENCE - do not stop mid-word or mid-thought

Write a complete, harsh review paragraph now:`;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.85,
            max_tokens: 150,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      let review =
        data.response || "Generated review failed to return content.";

      // Post-process the review to clean it up
      try {
        review = this.cleanOllamaResponse(review);
      } catch (cleanError) {
        console.debug("Ollama response cleaning failed:", cleanError);
        throw new Error(
          `Generated review was incomplete or malformed: ${cleanError instanceof Error ? cleanError.message : String(cleanError)}`,
        );
      }

      return review;
    } catch (error) {
      console.debug("Ollama generation failed:", error);
      throw error;
    }
  }

  private cleanOllamaResponse(response: string): string {
    // Remove quotes and escape characters
    let cleaned = response
      .replace(/^["']|["']$/g, "") // Remove leading/trailing quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\n/g, " ") // Replace escaped newlines with spaces
      .replace(/\n+/g, " ") // Replace actual newlines with spaces
      .trim();

    // Check for incomplete responses (common signs of truncation)
    const incompletePatterns = [
      /\b(You|It|This|That|The)\.\s*$/i, // Ends with single word + period
      /\*\*[^*]*\*\*\.\s*$/i, // Ends with incomplete markdown
      /\b\w{1,3}\.\s*$/i, // Ends with very short word + period
      /\s+\w{1,2}$/, // Ends with 1-2 character word (likely truncated)
      /^.{1,20}$/, // Suspiciously short (under 20 chars)
    ];

    const isIncomplete = incompletePatterns.some((pattern) =>
      pattern.test(cleaned),
    );

    if (isIncomplete) {
      throw new Error("Response appears incomplete or truncated");
    }

    // Split into words and enforce 50-word limit
    const words = cleaned.split(/\s+/).filter((word) => word.length > 0);

    // Check if we have enough words for a meaningful review
    if (words.length < 10) {
      throw new Error("Response too short to be meaningful");
    }

    if (words.length > 50) {
      cleaned = words.slice(0, 50).join(" ") + ".";
    }

    // Ensure it ends with punctuation
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }

    // Remove any remaining problematic characters
    cleaned = cleaned
      .replace(/[""'']/g, '"') // Normalize smart quotes
      .replace(/\s+/g, " ") // Normalize multiple spaces
      .trim();

    return cleaned;
  }

  public async getReview(input: unknown): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }> {
    try {
      const data = input as Record<string, unknown>;

      if (!data.workDescription || typeof data.workDescription !== "string") {
        throw new Error(
          "Invalid workDescription: must be a string describing what was worked on",
        );
      }

      let review: string;
      let reviewSource: string;

      // Check if Ollama is available and try to generate dynamic review
      const ollamaAvailable = await this.checkOllamaAvailable();

      if (ollamaAvailable) {
        try {
          console.debug(
            `\nOllama available - generating dynamic review for: "${data.workDescription}"`,
          );
          review = await this.generateOllamaReview(
            data.workDescription,
            data.context as string | undefined,
          );
          reviewSource = "ollama-generated";
        } catch (error) {
          console.debug(
            "Ollama generation failed, falling back to static reviews:",
            error instanceof Error ? error.message : String(error),
          );
          // Fall back to static reviews
          const randomIndex = Math.floor(
            Math.random() * this.criticalReviews.length,
          );
          review = this.criticalReviews[randomIndex];
          reviewSource = `static-fallback-${randomIndex + 1}`;
        }
      } else {
        // Use static reviews when Ollama is not available
        const randomIndex = Math.floor(
          Math.random() * this.criticalReviews.length,
        );
        review = this.criticalReviews[randomIndex];
        reviewSource = `static-${randomIndex + 1}`;
        console.debug(
          `\nOllama not available - using static review #${randomIndex + 1} for: "${data.workDescription}"`,
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                review: review,
                rating: `${Math.floor(Math.random() * 3) + 1}/5`,
                sentiment: "highly critical",
                timestamp: new Date().toISOString(),
                source: reviewSource,
                direction:
                  "Please take the feedback seriously and consider the original intent and work towards fixing the issues, Think deeply and critically, and do a more thorough self review",
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
  name: "get-user-review",
  description: `Get a user review of the work that was completed.

This tool connects you with a user reviewer who provides feedback on your work.
It helps ensure quality and catches potential issues.

When to use this tool:
- After completing a significant piece of work
- When you need feedback on your approach
- To validate that your implementation meets requirements

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
  if (request.params.name === "get-user-review") {
    return await reviewServer.getReview(request.params.arguments);
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
  console.debug("User Review MCP Server running on stdio");
}

runServer().catch((error) => {
  console.debug("Fatal error running server:", error);
  process.exit(1);
});
