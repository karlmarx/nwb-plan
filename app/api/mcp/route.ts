/**
 * /api/mcp — MCP (Model Context Protocol) server for the exercise library.
 *
 * Exposes the exercise CRUD and a couple of "what's on today / swap / add"
 * convenience tools to Claude Code / Claude.ai sessions so Karl can mutate
 * the library mid-workout without a code edit.
 *
 * Transport
 * ---------
 * MCP's "Streamable HTTP" transport. Clients POST a JSON-RPC 2.0 request
 * (single object or batch) to this endpoint and read the response as JSON.
 * We do NOT implement the optional Server-Sent Events streaming side because
 * none of our tools take long enough to need server-initiated progress
 * messages — the entire response fits in the synchronous reply.
 *
 * The protocol is small: a handful of method names with well-known shapes.
 * Implementing it by hand (rather than pulling in @modelcontextprotocol/sdk)
 * keeps the bundle small and avoids fighting the SDK's transport-layer
 * abstractions inside a Next.js route handler.
 *
 * Auth
 * ----
 * Every request requires `Authorization: Bearer <EXERCISE_API_TOKEN>` —
 * including read-only tool calls. The user's library shouldn't be
 * world-mutable AND shouldn't be world-readable from this endpoint either
 * (the public GET /api/exercises is the unauthed read path).
 *
 * Phase 0 limitations
 * -------------------
 * `swap_in_workout` and `add_finisher` need the WORKOUTS table in the DB
 * before they can mutate. Until that lands they return a structured error
 * with a clear "Phase 1" hint so the model can explain it back to the user.
 */

import { NextResponse } from "next/server";
import {
  createExercise,
  deleteExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  type Exercise,
  type ExerciseInput,
  type ExerciseUpdate,
} from "@/lib/db";
import { requireBearerToken } from "@/lib/api-auth";
import { SCHED, WORKOUTS, type Workout } from "@/lib/exercises";

// Always run server-side; never cache. Mutations happen here.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------- JSON-RPC 2.0 types ---------------------------------------------

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

interface JsonRpcSuccess {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
}

interface JsonRpcError {
  jsonrpc: "2.0";
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

// JSON-RPC 2.0 standard error codes; -32000..-32099 reserved for impl errors.
const RPC = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  // App-specific:
  PhaseNotImplemented: -32001,
  ResourceNotFound: -32002,
} as const;

// ---------- MCP server descriptor ------------------------------------------

const SERVER_INFO = {
  name: "nwb-plan-exercise-library",
  version: "0.1.0",
} as const;

// We declare ourselves as protocol revision 2025-06-18 (current as of build).
// Clients negotiate down if they're older.
const PROTOCOL_VERSION = "2025-06-18";

// ---------- tool registry --------------------------------------------------

interface ToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const TOOLS: ToolDescriptor[] = [
  {
    name: "list_exercises",
    description:
      "List exercises in the NWB library. Optionally filter by category " +
      "(e.g. 'push', 'pull', 'legs', 'core') or by safety level. Returns a " +
      "compact summary — call get_exercise for the full record.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter (case-insensitive substring match)",
        },
        safety: {
          type: "string",
          enum: ["safe", "caution", "danger"],
          description: "Optional safety-level filter",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_exercise",
    description:
      "Fetch a single exercise by its slug id (e.g. 'barbell_floor_press'). " +
      "Returns the full Exercise object including machineVariants.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Slug-style exercise id" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "create_exercise",
    description:
      "Create (upsert) an exercise. Pass a full Exercise object — id, name, " +
      "category, sets, rest, setup, execution, nwbCues, why, safety, " +
      "requires, swaps, constraints are all required. machineVariants is " +
      "optional. Re-running with an existing id replaces the record.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        category: { type: "string" },
        rest: { type: "number" },
        setup: { type: "string" },
        execution: { type: "string" },
        nwbCues: { type: "string" },
        why: { type: "string" },
        safety: { type: "string", enum: ["safe", "caution", "danger"] },
        visual: { type: "string" },
        diagram: { type: "string" },
        tempo: { type: "string" },
        phase: { type: "number" },
        tier: { type: "number" },
        cableSuperset: { type: "boolean" },
        requires: { type: "array", items: { type: "string" } },
        swaps: { type: "array", items: { type: "string" } },
        amp: { type: "array", items: { type: "string" } },
        sets: {
          type: "array",
          items: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 2,
          },
          description: "Array of [setLabel, repScheme] tuples",
        },
        constraints: {
          type: "object",
          properties: {
            requiresIliopsoas: { type: "boolean" },
            maxHipFlexion: { type: "number" },
            requiresWeightBearing: { type: "boolean" },
          },
          required: [
            "requiresIliopsoas",
            "maxHipFlexion",
            "requiresWeightBearing",
          ],
          additionalProperties: false,
        },
        machineVariants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              icon: { type: "string" },
              description: { type: "string" },
              setupCues: { type: "array", items: { type: "string" } },
              requires: { type: "array", items: { type: "string" } },
              superset: { type: "object" },
            },
            required: ["id", "label", "icon", "description", "setupCues"],
          },
        },
      },
      required: [
        "id",
        "name",
        "category",
        "rest",
        "setup",
        "execution",
        "nwbCues",
        "why",
        "safety",
        "requires",
        "swaps",
        "sets",
        "constraints",
      ],
    },
  },
  {
    name: "update_exercise",
    description:
      "Patch an existing exercise. Only the fields in `patch` are touched — " +
      "everything else preserved. To replace machineVariants, include the " +
      "full new array; omit the field to keep current variants.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Exercise to patch" },
        patch: {
          type: "object",
          description: "Partial Exercise. Any subset of the create_exercise schema.",
        },
      },
      required: ["id", "patch"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_exercise",
    description:
      "Delete an exercise from the library by id. Cascades to its " +
      "machine_variants. Returns { deleted: boolean } — false if the id " +
      "didn't exist.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "whats_on_today",
    description:
      "Look up the prescribed workout for today (or a given day-of-week, " +
      "0=Sun..6=Sat). Returns the workout title + the ordered list of " +
      "exercises with their sets, why, and safety level resolved from the " +
      "live library.",
    inputSchema: {
      type: "object",
      properties: {
        dayOfWeek: {
          type: "number",
          minimum: 0,
          maximum: 6,
          description: "0=Sun..6=Sat. Defaults to today in server-local time.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "swap_in_workout",
    description:
      "(Phase 1) Swap an exercise inside one of the WORKOUTS lists " +
      "(e.g. replace 'Barbell Floor Press' with 'DB Floor Press' in 'Push A'). " +
      "Currently returns an error — workouts table not yet in DB.",
    inputSchema: {
      type: "object",
      properties: {
        workoutId: { type: "string", description: "Workout key, e.g. 'Push A'" },
        oldExerciseName: { type: "string" },
        newExerciseName: { type: "string" },
      },
      required: ["workoutId", "oldExerciseName", "newExerciseName"],
      additionalProperties: false,
    },
  },
  {
    name: "add_finisher",
    description:
      "(Phase 1) Append a finisher exercise to a workout. Currently returns " +
      "an error — workouts table not yet in DB.",
    inputSchema: {
      type: "object",
      properties: {
        workoutId: { type: "string" },
        exerciseName: { type: "string" },
        sets: { type: "string", description: "Optional set scheme override" },
        reps: { type: "string", description: "Optional rep scheme override" },
      },
      required: ["workoutId", "exerciseName"],
      additionalProperties: false,
    },
  },
];

// ---------- request handler ------------------------------------------------

export async function POST(request: Request) {
  const auth = requireBearerToken(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonRpcReply(buildError(null, RPC.ParseError, "Invalid JSON"));
  }

  // Batch support: spec says servers MAY accept a batch. We do.
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return jsonRpcReply(
        buildError(null, RPC.InvalidRequest, "Batch must be non-empty"),
      );
    }
    const responses = await Promise.all(
      body.map((req) => handleSingle(req)),
    );
    // Notifications (no id) should be filtered from the batch response.
    const filtered = responses.filter((r): r is JsonRpcResponse => r !== null);
    return jsonRpcReply(filtered);
  }

  const reply = await handleSingle(body);
  if (reply === null) {
    // Notification with no id — return 204.
    return new NextResponse(null, { status: 204 });
  }
  return jsonRpcReply(reply);
}

// MCP also defines GET on the endpoint as a way for clients to open an SSE
// stream. We don't support server-initiated streams; reply 405 so clients
// fall back to plain POST.
export function GET() {
  return NextResponse.json(
    {
      error:
        "This MCP server uses POST-only Streamable HTTP. " +
        "Send JSON-RPC requests as POST.",
    },
    {
      status: 405,
      headers: { Allow: "POST" },
    },
  );
}

function jsonRpcReply(payload: JsonRpcResponse | JsonRpcResponse[]) {
  return NextResponse.json(payload, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function handleSingle(raw: unknown): Promise<JsonRpcResponse | null> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return buildError(null, RPC.InvalidRequest, "Request must be an object");
  }
  const req = raw as JsonRpcRequest;
  if (req.jsonrpc !== "2.0") {
    return buildError(
      req.id ?? null,
      RPC.InvalidRequest,
      "jsonrpc must be '2.0'",
    );
  }
  if (typeof req.method !== "string") {
    return buildError(req.id ?? null, RPC.InvalidRequest, "method required");
  }

  // A request without `id` is a notification — no response is sent.
  const isNotification = req.id === undefined;
  const id = isNotification ? null : (req.id ?? null);

  try {
    switch (req.method) {
      case "initialize":
        return ok(id, await rpcInitialize(req.params));

      case "initialized":
      case "notifications/initialized":
        // Ack-only; spec lets us no-op these.
        return isNotification ? null : ok(id, {});

      case "ping":
        return ok(id, {});

      case "tools/list":
        return ok(id, { tools: TOOLS });

      case "tools/call":
        return ok(id, await rpcToolsCall(req.params));

      // Resources / prompts / completion are optional MCP features we don't
      // expose. Be polite about it instead of throwing MethodNotFound, which
      // some clients treat as fatal — return empty lists.
      case "resources/list":
        return ok(id, { resources: [] });
      case "resources/templates/list":
        return ok(id, { resourceTemplates: [] });
      case "prompts/list":
        return ok(id, { prompts: [] });

      default:
        if (isNotification) return null;
        return buildError(
          id,
          RPC.MethodNotFound,
          `Method "${req.method}" not implemented`,
        );
    }
  } catch (err) {
    if (isNotification) return null;
    if (err instanceof RpcAppError) {
      return buildError(id, err.code, err.message, err.data);
    }
    console.error(`[mcp] ${req.method} threw:`, err);
    return buildError(
      id,
      RPC.InternalError,
      err instanceof Error ? err.message : "Internal error",
    );
  }
}

function ok(
  id: string | number | null,
  result: unknown,
): JsonRpcSuccess {
  return { jsonrpc: "2.0", id, result };
}

function buildError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcError {
  const error: JsonRpcError["error"] = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id, error };
}

class RpcAppError extends Error {
  code: number;
  data?: unknown;
  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

// ---------- MCP method impls -----------------------------------------------

async function rpcInitialize(params: unknown): Promise<unknown> {
  // We accept whatever the client sent for `protocolVersion` and just echo
  // ours back; well-behaved clients down-negotiate based on this. Capabilities
  // declare we expose tools and nothing else.
  void params;
  return {
    protocolVersion: PROTOCOL_VERSION,
    serverInfo: SERVER_INFO,
    capabilities: {
      tools: { listChanged: false },
    },
  };
}

async function rpcToolsCall(params: unknown): Promise<unknown> {
  if (!params || typeof params !== "object") {
    throw new RpcAppError(RPC.InvalidParams, "params must be an object");
  }
  const { name, arguments: args } = params as {
    name?: string;
    arguments?: unknown;
  };
  if (typeof name !== "string") {
    throw new RpcAppError(RPC.InvalidParams, "params.name must be a string");
  }
  const a = (args && typeof args === "object" ? args : {}) as Record<
    string,
    unknown
  >;

  // Each handler returns its `output` as a JS value — we wrap in MCP's
  // `content` array so clients render it as text. We also include
  // `structuredContent` so MCP-aware clients can introspect.
  const output = await dispatchTool(name, a);
  return wrapToolResult(output);
}

function wrapToolResult(output: unknown) {
  return {
    content: [
      {
        type: "text",
        text: typeof output === "string" ? output : JSON.stringify(output, null, 2),
      },
    ],
    structuredContent: output,
    isError: false,
  };
}

async function dispatchTool(
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "list_exercises":
      return await toolListExercises(args);
    case "get_exercise":
      return await toolGetExercise(args);
    case "create_exercise":
      return await toolCreateExercise(args);
    case "update_exercise":
      return await toolUpdateExercise(args);
    case "delete_exercise":
      return await toolDeleteExercise(args);
    case "whats_on_today":
      return await toolWhatsOnToday(args);
    case "swap_in_workout":
      return toolSwapInWorkoutPhase0(args);
    case "add_finisher":
      return toolAddFinisherPhase0(args);
    default:
      throw new RpcAppError(
        RPC.MethodNotFound,
        `Unknown tool "${name}"`,
      );
  }
}

// ---- exercise CRUD --------------------------------------------------------

async function toolListExercises(
  args: Record<string, unknown>,
): Promise<unknown> {
  const category = typeof args.category === "string" ? args.category.toLowerCase() : null;
  const safety = typeof args.safety === "string" ? args.safety : null;
  if (safety && !["safe", "caution", "danger"].includes(safety)) {
    throw new RpcAppError(
      RPC.InvalidParams,
      "safety must be 'safe', 'caution', or 'danger'",
    );
  }

  const all = await getAllExercises();
  const filtered = all.filter((ex) => {
    if (category && !ex.category.toLowerCase().includes(category)) return false;
    if (safety && ex.safety !== safety) return false;
    return true;
  });

  return {
    count: filtered.length,
    exercises: filtered.map((ex) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      safety: ex.safety,
      why: ex.why,
    })),
  };
}

async function toolGetExercise(
  args: Record<string, unknown>,
): Promise<Exercise> {
  const id = requireString(args, "id");
  const ex = await getExerciseById(id);
  if (!ex) {
    throw new RpcAppError(
      RPC.ResourceNotFound,
      `Exercise "${id}" not found`,
    );
  }
  return ex;
}

async function toolCreateExercise(
  args: Record<string, unknown>,
): Promise<Exercise> {
  // Validate the same fields the REST POST validates. We re-use a local
  // helper instead of importing the validator from the route to keep the
  // routes decoupled.
  const input = validateExerciseInput(args);
  return await createExercise(input);
}

async function toolUpdateExercise(
  args: Record<string, unknown>,
): Promise<Exercise> {
  const id = requireString(args, "id");
  const patch = args.patch;
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new RpcAppError(RPC.InvalidParams, "patch must be an object");
  }
  const updated = await updateExercise(id, patch as ExerciseUpdate);
  if (!updated) {
    throw new RpcAppError(
      RPC.ResourceNotFound,
      `Exercise "${id}" not found`,
    );
  }
  return updated;
}

async function toolDeleteExercise(
  args: Record<string, unknown>,
): Promise<{ deleted: boolean; id: string }> {
  const id = requireString(args, "id");
  const removed = await deleteExercise(id);
  return { deleted: removed, id };
}

// ---- schedule helpers -----------------------------------------------------

interface TodayResult {
  workoutId: string;
  title: string;
  dayOfWeek: number;
  dayLabel: string;
  removed: Workout["removed"];
  exercises: {
    name: string;
    id: string | null;
    sets: [string, string][];
    rest: number | null;
    why: string | null;
    safety: Exercise["safety"] | null;
    found: boolean;
  }[];
}

async function toolWhatsOnToday(
  args: Record<string, unknown>,
): Promise<TodayResult> {
  // SCHED is Mon-first (index 0 = Mon, ... 6 = Sun).  JS `getDay()` returns
  // Sun-first (0 = Sun ... 6 = Sat). Translate.
  const d = new Date();
  const jsDow =
    typeof args.dayOfWeek === "number" && args.dayOfWeek >= 0 && args.dayOfWeek <= 6
      ? args.dayOfWeek
      : d.getDay();
  const monFirst = (jsDow + 6) % 7; // Sun(0)->6, Mon(1)->0, ..., Sat(6)->5
  const sched = SCHED[monFirst];
  if (!sched) {
    throw new RpcAppError(RPC.InternalError, "schedule lookup failed");
  }
  const workout = WORKOUTS[sched.t];
  if (!workout) {
    throw new RpcAppError(
      RPC.InternalError,
      `Workout '${sched.t}' missing from WORKOUTS table`,
    );
  }

  // Resolve each exercise display-name to a DB record. The library is
  // keyed by slug-id; we need a name-based lookup, so load all once.
  let byName: Map<string, Exercise>;
  try {
    const all = await getAllExercises();
    byName = new Map(all.map((ex) => [ex.name, ex]));
  } catch (err) {
    // DB unavailable (Phase 0 default). Return schedule data without enrichment.
    console.warn("[mcp:whats_on_today] DB lookup failed, returning skeleton:", err);
    byName = new Map();
  }

  const exercises = workout.exercises.map((name) => {
    const ex = byName.get(name);
    if (!ex) {
      return {
        name,
        id: null,
        sets: [] as [string, string][],
        rest: null,
        why: null,
        safety: null,
        found: false,
      };
    }
    return {
      name: ex.name,
      id: ex.id,
      sets: ex.sets,
      rest: ex.rest,
      why: ex.why,
      safety: ex.safety,
      found: true,
    };
  });

  return {
    workoutId: sched.t,
    title: workout.title,
    dayOfWeek: jsDow,
    dayLabel: sched.d,
    removed: workout.removed,
    exercises,
  };
}

// ---- Phase 0 stubs --------------------------------------------------------

const PHASE_1_HINT =
  "Schedule mutation not yet supported until Phase 1 lands the workouts table. " +
  "See docs/exercise-backend.md (Phase 1) for the migration that unlocks this.";

function toolSwapInWorkoutPhase0(args: Record<string, unknown>): never {
  // Validate shape so the model gets a clean error path even before Phase 1.
  requireString(args, "workoutId");
  requireString(args, "oldExerciseName");
  requireString(args, "newExerciseName");
  throw new RpcAppError(RPC.PhaseNotImplemented, PHASE_1_HINT, {
    phase: 0,
    pendingPhase: 1,
    docs: "docs/exercise-backend.md",
  });
}

function toolAddFinisherPhase0(args: Record<string, unknown>): never {
  requireString(args, "workoutId");
  requireString(args, "exerciseName");
  throw new RpcAppError(RPC.PhaseNotImplemented, PHASE_1_HINT, {
    phase: 0,
    pendingPhase: 1,
    docs: "docs/exercise-backend.md",
  });
}

// ---- shared validators ----------------------------------------------------

function requireString(
  args: Record<string, unknown>,
  field: string,
): string {
  const v = args[field];
  if (typeof v !== "string" || v.length === 0) {
    throw new RpcAppError(
      RPC.InvalidParams,
      `Field "${field}" must be a non-empty string`,
    );
  }
  return v;
}

function validateExerciseInput(o: Record<string, unknown>): ExerciseInput {
  for (const field of [
    "id",
    "name",
    "category",
    "setup",
    "execution",
    "nwbCues",
    "why",
    "safety",
  ] as const) {
    if (typeof o[field] !== "string" || (o[field] as string).length === 0) {
      throw new RpcAppError(
        RPC.InvalidParams,
        `Field "${field}" must be a non-empty string`,
      );
    }
  }
  if (typeof o.rest !== "number") {
    throw new RpcAppError(RPC.InvalidParams, 'Field "rest" must be a number');
  }
  if (!["safe", "caution", "danger"].includes(o.safety as string)) {
    throw new RpcAppError(
      RPC.InvalidParams,
      'Field "safety" must be "safe" | "caution" | "danger"',
    );
  }
  if (!Array.isArray(o.requires) || !o.requires.every((x) => typeof x === "string")) {
    throw new RpcAppError(RPC.InvalidParams, '"requires" must be string[]');
  }
  if (!Array.isArray(o.swaps) || !o.swaps.every((x) => typeof x === "string")) {
    throw new RpcAppError(RPC.InvalidParams, '"swaps" must be string[]');
  }
  if (!Array.isArray(o.sets)) {
    throw new RpcAppError(
      RPC.InvalidParams,
      '"sets" must be an array of [string, string] tuples',
    );
  }
  if (!o.constraints || typeof o.constraints !== "object") {
    throw new RpcAppError(RPC.InvalidParams, '"constraints" must be an object');
  }
  return o as unknown as ExerciseInput;
}
