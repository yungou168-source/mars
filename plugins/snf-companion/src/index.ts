import type {
  SNFPlugin,
  SNFRoute,
  SNFMigration,
  SNFHook,
  SNFContext,
  SNFServer,
} from "@sovereign-nation/core";

// ============================================================================
// Types
// ============================================================================

export type CompanionType = "scholar" | "merchant" | "diplomat" | "worker" | "artist" | "guardian";

export type CompanionAttribute = "strength" | "intelligence" | "charisma" | "wisdom" | "creativity" | "defense";

export type MissionStatus = "available" | "in_progress" | "completed";

export interface Companion {
  id: string;
  owner: string;
  type: CompanionType;
  level: number;
  xp: number;
  health: number;
  happiness: number;
  createdAt: Date;
}

export interface CompanionAttributes {
  strength: number;
  intelligence: number;
  charisma: number;
  wisdom: number;
  creativity: number;
  defense: number;
}

export interface CompanionMission {
  id: string;
  companionId: string;
  title: string;
  description: string;
  xpReward: number;
  status: MissionStatus;
  completedAt?: Date;
}

export interface CompanionWithAttributes extends Companion {
  attributes: CompanionAttributes;
}

export interface GrowthStats {
  companionId: string;
  currentLevel: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  missionsCompleted: number;
  trainingSessions: number;
  attributeGrowth: CompanionAttributes;
}

export interface MarketplaceListing {
  type: CompanionType;
  description: string;
  primaryAttribute: CompanionAttribute;
  baseStats: CompanionAttributes;
}

export interface ClaimCompanionRequest {
  type: CompanionType;
}

export interface TrainCompanionRequest {
  attribute: CompanionAttribute;
  intensity: "light" | "medium" | "heavy";
}

// ============================================================================
// Companion Configuration
// ============================================================================

const COMPANION_CONFIG: Record<CompanionType, { description: string; primaryAttribute: CompanionAttribute }> = {
  scholar: { description: "A wise advisor focused on knowledge and strategy", primaryAttribute: "intelligence" },
  merchant: { description: "A trade expert who helps with commerce and negotiation", primaryAttribute: "charisma" },
  diplomat: { description: "A skilled mediator for forming alliances and resolving conflicts", primaryAttribute: "wisdom" },
  worker: { description: "A dedicated builder focused on productivity and efficiency", primaryAttribute: "strength" },
  artist: { description: "A creative spirit that inspires and beautifies", primaryAttribute: "creativity" },
  guardian: { description: "A protective ally focused on defense and security", primaryAttribute: "defense" },
};

const BASE_ATTRIBUTE_VALUE = 10;
const XP_PER_LEVEL = 1000;
const MAX_HEALTH = 100;
const MAX_HAPPINESS = 100;

// ============================================================================
// Mission Templates
// ============================================================================

const MISSION_TEMPLATES: Array<{ title: string; description: string; baseXp: number }> = [
  { title: "Morning Training", description: "Complete a focused training session", baseXp: 50 },
  { title: "Knowledge Gathering", description: "Research and learn something new", baseXp: 75 },
  { title: "Social Interaction", description: "Engage with fellow citizens", baseXp: 60 },
  { title: "Creative Exercise", description: "Practice creative skills", baseXp: 55 },
  { title: "Rest and Recovery", description: "Take time to recover and reflect", baseXp: 30 },
  { title: "Challenge Accepted", description: "Complete a difficult task", baseXp: 100 },
  { title: "Community Service", description: "Help others in the community", baseXp: 80 },
  { title: "Skill Mastery", description: "Practice a specialized skill", baseXp: 90 },
];

// ============================================================================
// Database Helper Functions
// ============================================================================

interface DbCompanion {
  id: string;
  owner: string;
  type: CompanionType;
  level: number;
  xp: number;
  health: number;
  happiness: number;
  created_at: Date;
}

interface DbCompanionAttribute {
  companion_id: string;
  attribute: CompanionAttribute;
  value: number;
}

interface DbCompanionMission {
  id: string;
  companion_id: string;
  title: string;
  description: string;
  xp_reward: number;
  status: MissionStatus;
  completed_at: Date | null;
}

async function getCompanionsByOwner(ctx: SNFContext, ownerId: string): Promise<Companion[]> {
  const rows = await ctx.db.query<DbCompanion>(
    "SELECT * FROM companions WHERE owner = $1 ORDER BY created_at DESC",
    [ownerId]
  );
  return rows.map((row) => ({
    id: row.id,
    owner: row.owner,
    type: row.type,
    level: row.level,
    xp: row.xp,
    health: row.health,
    happiness: row.happiness,
    createdAt: row.created_at,
  }));
}

async function getCompanionById(ctx: SNFContext, companionId: string): Promise<Companion | null> {
  const rows = await ctx.db.query<DbCompanion>(
    "SELECT * FROM companions WHERE id = $1",
    [companionId]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    owner: row.owner,
    type: row.type,
    level: row.level,
    xp: row.xp,
    health: row.health,
    happiness: row.happiness,
    createdAt: row.created_at,
  };
}

async function getCompanionAttributes(ctx: SNFContext, companionId: string): Promise<CompanionAttributes> {
  const rows = await ctx.db.query<DbCompanionAttribute>(
    "SELECT attribute, value FROM companion_attributes WHERE companion_id = $1",
    [companionId]
  );

  const attributes: CompanionAttributes = {
    strength: BASE_ATTRIBUTE_VALUE,
    intelligence: BASE_ATTRIBUTE_VALUE,
    charisma: BASE_ATTRIBUTE_VALUE,
    wisdom: BASE_ATTRIBUTE_VALUE,
    creativity: BASE_ATTRIBUTE_VALUE,
    defense: BASE_ATTRIBUTE_VALUE,
  };

  for (const row of rows) {
    (attributes as Record<string, number>)[row.attribute] = row.value;
  }

  return attributes;
}

async function initializeCompanionAttributes(
  ctx: SNFContext,
  companionId: string,
  type: CompanionType
): Promise<CompanionAttributes> {
  const config = COMPANION_CONFIG[type];
  const primaryAttr = config.primaryAttribute;

  const attributes: CompanionAttributes = {
    strength: BASE_ATTRIBUTE_VALUE,
    intelligence: BASE_ATTRIBUTE_VALUE,
    charisma: BASE_ATTRIBUTE_VALUE,
    wisdom: BASE_ATTRIBUTE_VALUE,
    creativity: BASE_ATTRIBUTE_VALUE,
    defense: BASE_ATTRIBUTE_VALUE,
  };

  attributes[primaryAttr] = BASE_ATTRIBUTE_VALUE + 5;

  for (const [attr, value] of Object.entries(attributes)) {
    await ctx.db.query(
      "INSERT INTO companion_attributes (companion_id, attribute, value) VALUES ($1, $2, $3)",
      [companionId, attr, value]
    );
  }

  return attributes;
}

async function getMissionsForCompanion(
  ctx: SNFContext,
  companionId: string
): Promise<CompanionMission[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let rows = await ctx.db.query<DbCompanionMission>(
    "SELECT * FROM companion_missions WHERE companion_id = $1 AND completed_at >= $2",
    [companionId, today]
  );

  if (rows.length === 0) {
    const numMissions = 3;
    for (let i = 0; i < numMissions; i++) {
      const template = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)];
      const missionId = `${companionId}-${Date.now()}-${i}`;
      await ctx.db.query(
        `INSERT INTO companion_missions (id, companion_id, title, description, xp_reward, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [missionId, companionId, template.title, template.description, template.baseXp, "available"]
      );
    }
    rows = await ctx.db.query<DbCompanionMission>(
      "SELECT * FROM companion_missions WHERE companion_id = $1 AND completed_at >= $2",
      [companionId, today]
    );
  }

  return rows.map((row) => ({
    id: row.id,
    companionId: row.companion_id,
    title: row.title,
    description: row.description,
    xpReward: row.xp_reward,
    status: row.status,
    completedAt: row.completed_at || undefined,
  }));
}

async function updateCompanionXp(
  ctx: SNFContext,
  companionId: string,
  xpGained: number
): Promise<{ newLevel: number; leveledUp: boolean }> {
  const companion = await getCompanionById(ctx, companionId);
  if (!companion) throw new Error("Companion not found");

  const newXp = companion.xp + xpGained;
  let newLevel = companion.level;
  let leveledUp = false;

  const newLevelFromXp = Math.floor(newXp / XP_PER_LEVEL) + 1;
  if (newLevelFromXp > newLevel) {
    newLevel = newLevelFromXp;
    leveledUp = true;
    const healthBonus = 10;
    const newHealth = Math.min(companion.health + healthBonus, MAX_HEALTH);
    const newHappiness = Math.min(companion.happiness + 5, MAX_HAPPINESS);
    await ctx.db.query(
      "UPDATE companions SET level = $1, xp = $2, health = $3, happiness = $4 WHERE id = $5",
      [newLevel, newXp, newHealth, newHappiness, companionId]
    );
  } else {
    await ctx.db.query("UPDATE companions SET xp = $1 WHERE id = $2", [newXp, companionId]);
  }

  return { newLevel, leveledUp };
}

// ============================================================================
// Plugin Implementation
// ============================================================================

export function createCompanionPlugin(): SNFPlugin {
  const plugin: SNFPlugin = {
    name: "snf-companion",
    version: "1.0.0",
    description: "AI companion system with growth, missions, and social features",

    migrations(): SNFMigration[] {
      return [
        {
          id: "001_create_companions_table",
          up: async (ctx) => {
            await ctx.db.query(`
              CREATE TABLE IF NOT EXISTS companions (
                id TEXT PRIMARY KEY,
                owner TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('scholar', 'merchant', 'diplomat', 'worker', 'artist', 'guardian')),
                level INTEGER NOT NULL DEFAULT 1,
                xp INTEGER NOT NULL DEFAULT 0,
                health INTEGER NOT NULL DEFAULT 100,
                happiness INTEGER NOT NULL DEFAULT 100,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
              );
              CREATE INDEX IF NOT EXISTS idx_companions_owner ON companions(owner);
            `);
          },
          down: async (ctx) => {
            await ctx.db.query("DROP TABLE IF EXISTS companions CASCADE;");
          },
        },
        {
          id: "002_create_companion_attributes_table",
          up: async (ctx) => {
            await ctx.db.query(`
              CREATE TABLE IF NOT EXISTS companion_attributes (
                companion_id TEXT NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
                attribute TEXT NOT NULL CHECK (attribute IN ('strength', 'intelligence', 'charisma', 'wisdom', 'creativity', 'defense')),
                value INTEGER NOT NULL DEFAULT 10,
                PRIMARY KEY (companion_id, attribute)
              );
              CREATE INDEX IF NOT EXISTS idx_companion_attributes_companion ON companion_attributes(companion_id);
            `);
          },
          down: async (ctx) => {
            await ctx.db.query("DROP TABLE IF EXISTS companion_attributes CASCADE;");
          },
        },
        {
          id: "003_create_companion_missions_table",
          up: async (ctx) => {
            await ctx.db.query(`
              CREATE TABLE IF NOT EXISTS companion_missions (
                id TEXT PRIMARY KEY,
                companion_id TEXT NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                xp_reward INTEGER NOT NULL DEFAULT 50,
                status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_progress', 'completed')),
                completed_at TIMESTAMP
              );
              CREATE INDEX IF NOT EXISTS idx_companion_missions_companion ON companion_missions(companion_id);
              CREATE INDEX IF NOT EXISTS idx_companion_missions_status ON companion_missions(status);
            `);
          },
          down: async (ctx) => {
            await ctx.db.query("DROP TABLE IF EXISTS companion_missions CASCADE;");
          },
        },
      ];
    },

    routes(): SNFRoute[] {
      return [
        // List all companions for the authenticated citizen
        {
          method: "GET",
          path: "/companion",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const companions = await getCompanionsByOwner(ctx, citizen.id);
            const companionsWithAttributes = await Promise.all(
              companions.map(async (comp) => {
                const attributes = await getCompanionAttributes(ctx, comp.id);
                return { ...comp, attributes };
              })
            );

            return ctx.json({ companions: companionsWithAttributes });
          },
        },

        // Get companion details
        {
          method: "GET",
          path: "/companion/:id",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { id } = ctx.params;
            const companion = await getCompanionById(ctx, id);

            if (!companion) {
              return ctx.json({ error: "Companion not found" }, { status: 404 });
            }

            if (companion.owner !== citizen.id) {
              return ctx.json({ error: "Forbidden" }, { status: 403 });
            }

            const attributes = await getCompanionAttributes(ctx, id);
            const missions = await getMissionsForCompanion(ctx, id);

            return ctx.json({
              companion: { ...companion, attributes },
              missions,
            });
          },
        },

        // Claim a new companion
        {
          method: "POST",
          path: "/companion/claim",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await ctx.json<ClaimCompanionRequest>();
            const { type } = body;

            if (!type || !COMPANION_CONFIG[type]) {
              return ctx.json(
                { error: "Invalid companion type. Must be one of: scholar, merchant, diplomat, worker, artist, guardian" },
                { status: 400 }
              );
            }

            const existingCompanions = await getCompanionsByOwner(ctx, citizen.id);
            if (existingCompanions.length >= 5) {
              return ctx.json({ error: "Maximum companions reached (5)" }, { status: 400 });
            }

            const companionId = `companion-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            await ctx.db.query(
              `INSERT INTO companions (id, owner, type, level, xp, health, happiness)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [companionId, citizen.id, type, 1, 0, MAX_HEALTH, MAX_HAPPINESS]
            );

            const attributes = await initializeCompanionAttributes(ctx, companionId, type);
            await getMissionsForCompanion(ctx, companionId);

            return ctx.json({
              message: "Companion claimed successfully!",
              companion: {
                id: companionId,
                owner: citizen.id,
                type,
                level: 1,
                xp: 0,
                health: MAX_HEALTH,
                happiness: MAX_HAPPINESS,
                createdAt: new Date(),
                attributes,
              },
            }, { status: 201 });
          },
        },

        // Get daily missions for a companion
        {
          method: "GET",
          path: "/companion/:id/missions",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { id } = ctx.params;
            const companion = await getCompanionById(ctx, id);

            if (!companion) {
              return ctx.json({ error: "Companion not found" }, { status: 404 });
            }

            if (companion.owner !== citizen.id) {
              return ctx.json({ error: "Forbidden" }, { status: 403 });
            }

            const missions = await getMissionsForCompanion(ctx, id);
            return ctx.json({ missions });
          },
        },

        // Complete a mission
        {
          method: "POST",
          path: "/companion/:id/missions/:missionId/complete",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { id, missionId } = ctx.params;
            const companion = await getCompanionById(ctx, id);

            if (!companion) {
              return ctx.json({ error: "Companion not found" }, { status: 404 });
            }

            if (companion.owner !== citizen.id) {
              return ctx.json({ error: "Forbidden" }, { status: 403 });
            }

            const missionRows = await ctx.db.query<DbCompanionMission>(
              "SELECT * FROM companion_missions WHERE id = $1 AND companion_id = $2",
              [missionId, id]
            );

            if (missionRows.length === 0) {
              return ctx.json({ error: "Mission not found" }, { status: 404 });
            }

            const mission = missionRows[0];
            if (mission.status === "completed") {
              return ctx.json({ error: "Mission already completed" }, { status: 400 });
            }

            await ctx.db.query(
              `UPDATE companion_missions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
              [missionId]
            );

            const { newLevel, leveledUp } = await updateCompanionXp(ctx, id, mission.xp_reward);

            const happinessBoost = Math.floor(Math.random() * 5) + 3;
            const newHappiness = Math.min(companion.happiness + happinessBoost, MAX_HAPPINESS);
            await ctx.db.query("UPDATE companions SET happiness = $1 WHERE id = $2", [newHappiness, id]);

            return ctx.json({
              message: "Mission completed!",
              xpGained: mission.xp_reward,
              newLevel,
              leveledUp,
              happinessBoost: newHappiness - companion.happiness,
            });
          },
        },

        // Get growth statistics
        {
          method: "GET",
          path: "/companion/:id/growth",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { id } = ctx.params;
            const companion = await getCompanionById(ctx, id);

            if (!companion) {
              return ctx.json({ error: "Companion not found" }, { status: 404 });
            }

            if (companion.owner !== citizen.id) {
              return ctx.json({ error: "Forbidden" }, { status: 403 });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const missionCountRows = await ctx.db.query<{ count: string }>(
              "SELECT COUNT(*) as count FROM companion_missions WHERE companion_id = $1 AND status = 'completed'",
              [id]
            );
            const missionsCompleted = parseInt(missionCountRows[0]?.count || "0", 10);

            const xpInCurrentLevel = companion.xp % XP_PER_LEVEL;
            const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

            const growthStats: GrowthStats = {
              companionId: id,
              currentLevel: companion.level,
              xpToNextLevel,
              totalXpEarned: companion.xp,
              missionsCompleted,
              trainingSessions: 0,
              attributeGrowth: await getCompanionAttributes(ctx, id),
            };

            return ctx.json({ growth: growthStats });
          },
        },

        // Get marketplace listings
        {
          method: "GET",
          path: "/companion/marketplace",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const existingCompanions = await getCompanionsByOwner(ctx, citizen.id);
            const ownedTypes = new Set(existingCompanions.map((c) => c.type));

            const listings: MarketplaceListing[] = (
              Object.entries(COMPANION_CONFIG) as [CompanionType, { description: string; primaryAttribute: CompanionAttribute }][]
            ).map(([type, config]) => {
              const baseStats: CompanionAttributes = {
                strength: BASE_ATTRIBUTE_VALUE,
                intelligence: BASE_ATTRIBUTE_VALUE,
                charisma: BASE_ATTRIBUTE_VALUE,
                wisdom: BASE_ATTRIBUTE_VALUE,
                creativity: BASE_ATTRIBUTE_VALUE,
                defense: BASE_ATTRIBUTE_VALUE,
              };
              baseStats[config.primaryAttribute] = BASE_ATTRIBUTE_VALUE + 5;

              return {
                type,
                description: config.description,
                primaryAttribute: config.primaryAttribute,
                baseStats,
                owned: ownedTypes.has(type),
              };
            });

            return ctx.json({
              marketplace: listings,
              ownedCount: existingCompanions.length,
              maxCompanions: 5,
            });
          },
        },

        // Train a companion
        {
          method: "POST",
          path: "/companion/:id/train",
          handler: async (ctx) => {
            const citizen = ctx.state.citizen;
            if (!citizen) {
              return ctx.json({ error: "Unauthorized" }, { status: 401 });
            }

            const { id } = ctx.params;
            const companion = await getCompanionById(ctx, id);

            if (!companion) {
              return ctx.json({ error: "Companion not found" }, { status: 404 });
            }

            if (companion.owner !== citizen.id) {
              return ctx.json({ error: "Forbidden" }, { status: 403 });
            }

            const body = await ctx.json<TrainCompanionRequest>();
            const { attribute, intensity } = body;

            const validAttributes: CompanionAttribute[] = [
              "strength",
              "intelligence",
              "charisma",
              "wisdom",
              "creativity",
              "defense",
            ];
            if (!attribute || !validAttributes.includes(attribute)) {
              return ctx.json(
                { error: "Invalid attribute. Must be one of: strength, intelligence, charisma, wisdom, creativity, defense" },
                { status: 400 }
              );
            }

            const validIntensities = ["light", "medium", "heavy"];
            if (!intensity || !validIntensities.includes(intensity)) {
              return ctx.json(
                { error: "Invalid intensity. Must be one of: light, medium, heavy" },
                { status: 400 }
              );
            }

            const intensityMultipliers = { light: 1, medium: 2, heavy: 3 };
            const healthCosts = { light: 5, medium: 10, heavy: 20 };
            const happinessCosts = { light: 3, medium: 7, heavy: 12 };

            const currentHealth = companion.health;
            const healthCost = healthCosts[intensity];
            const happinessCost = happinessCosts[intensity];

            if (currentHealth < healthCost) {
              return ctx.json(
                { error: "Companion is too tired to train. Wait for health to recover." },
                { status: 400 }
              );
            }

            const currentAttrs = await getCompanionAttributes(ctx, id);
            const attributeGain = 1 * intensityMultipliers[intensity];
            const newValue = currentAttrs[attribute] + attributeGain;

            await ctx.db.query(
              `UPDATE companion_attributes SET value = $1 WHERE companion_id = $2 AND attribute = $3`,
              [newValue, id, attribute]
            );

            const newHealth = Math.max(1, currentHealth - healthCost);
            const newHappiness = Math.max(1, companion.happiness - happinessCost);

            await ctx.db.query(
              "UPDATE companions SET health = $1, happiness = $2 WHERE id = $3",
              [newHealth, newHappiness, id]
            );

            const xpGained = 25 * intensityMultipliers[intensity];
            const { newLevel, leveledUp } = await updateCompanionXp(ctx, id, xpGained);

            return ctx.json({
              message: "Training completed!",
              attribute,
              attributeGain,
              newAttributeValue: newValue,
              healthCost,
              newHealth,
              happinessCost,
              newHappiness,
              xpGained,
              newLevel,
              leveledUp,
            });
          },
        },
      ];
    },

    hooks(): SNFHook[] {
      return [
        {
          name: "citizen.registered",
          handler: async (ctx) => {
            const { citizen } = ctx.state;
            if (!citizen) return;

            ctx.log(`Welcome message for new citizen ${citizen.id}`);

            const welcomeMessage = {
              title: "Your AI Companion Awaits!",
              message:
                "Welcome to the Sovereign Nation! As a new citizen, you are eligible to claim your first AI companion. Companions will assist you on your journey through daily missions, training, and growth. Visit the companion marketplace to choose your companion type!",
              action: {
                label: "Claim Companion",
                path: "/companion/claim",
              },
            };

            ctx.log(`New citizen welcome sent: ${JSON.stringify(welcomeMessage)}`);
          },
        },
      ];
    },
  };

  return plugin;
}

export default createCompanionPlugin;
