#include "FighterController.h"
#include <drogon/orm/DbClient.h>
#include <cmath>
#include <random>

using namespace drogon;
using namespace drogon::orm;

// ============================================================
// Base stats per character type
// ============================================================

namespace {

struct BaseStats {
    int hp, atk, def, spd, crt, lck;
};

const std::map<std::string, BaseStats> kBaseStats = {
    {"knight",    {120, 12, 14,  6,  5,  8}},
    {"rogue",     { 85, 14,  6, 16, 15, 10}},
    {"mage",      { 80, 18,  4, 10, 10, 14}},
    {"berserker", {100, 16,  5, 12, 10,  6}},
};

struct WeaponBonus {
    int atk, def, spd, crt;
};

const std::map<std::string, WeaponBonus> kWeaponBonus = {
    {"iron_sword",    { 4, 0,  1,  0}},
    {"war_hammer",    { 6, 2, -2,  0}},
    {"shadow_dagger", { 2, 0,  4,  5}},
};

// ============================================================
// Deterministic PRNG (xorshift32)
// ============================================================

struct Rng {
    uint32_t state;
    explicit Rng(uint32_t seed) : state(seed ? seed : 1) {}
    uint32_t next() {
        state ^= state << 13;
        state ^= state >> 17;
        state ^= state << 5;
        return state;
    }
    int range(int lo, int hi) {
        return lo + static_cast<int>(next() % static_cast<uint32_t>(hi - lo + 1));
    }
    bool chance(int pct) { return range(1, 100) <= pct; }
};

// ============================================================
// Combat engine
// ============================================================

struct FighterState {
    std::string id;
    std::string name;
    std::string charType;
    int hp, maxHp, atk, def, spd, crt, lck;
    // Status effects
    int poisonTurns = 0;
    int defBuffTurns = 0;
    int defBuffAmount = 0;
    int absorbShield = 0;
    bool stunned = false;
    // Skill cooldowns
    int skill1Cd = 0;
    int skill2Cd = 0;
    // Weapon special
    std::string weapon;
};

Json::Value runCombat(FighterState &f1, FighterState &f2, uint32_t seed) {
    Rng rng(seed);
    Json::Value log(Json::arrayValue);

    auto effectiveDef = [](const FighterState &f) {
        return f.def + (f.defBuffTurns > 0 ? f.defBuffAmount : 0);
    };

    auto applyDamage = [](FighterState &target, int rawDmg) -> int {
        if (target.absorbShield > 0) {
            if (rawDmg <= target.absorbShield) {
                target.absorbShield -= rawDmg;
                return 0;
            }
            rawDmg -= target.absorbShield;
            target.absorbShield = 0;
        }
        target.hp -= rawDmg;
        if (target.hp < 0) target.hp = 0;
        return rawDmg;
    };

    auto doAction = [&](FighterState &actor, FighterState &target, Rng &rng) -> Json::Value {
        Json::Value action;
        action["actor"] = actor.id;

        // Dodge check
        int dodgeChance = std::max(0, std::min(25, (actor.spd - target.spd) * 2));
        // Note: target dodges actor's attack
        int targetDodge = std::max(0, std::min(25, (target.spd - actor.spd) * 2));
        if (rng.chance(targetDodge)) {
            action["type"] = "dodge";
            action["damage"] = 0;
            action["dodged"] = true;
            return action;
        }

        // Pick action: basic (50%), skill1 (25%), skill2 (25%)
        int roll = rng.range(1, 100);
        std::string actionType = "basic";
        if (roll <= 25 && actor.skill1Cd == 0) actionType = "skill1";
        else if (roll <= 50 && actor.skill2Cd == 0) actionType = "skill2";

        action["dodged"] = false;

        if (actionType == "basic") {
            action["type"] = "basic";
            int dmg = std::max(1, actor.atk - effectiveDef(target));
            // Weapon specials on basic attack
            bool stunProc = false;
            int extraCrt = 0;
            if (actor.weapon == "war_hammer") stunProc = rng.chance(10);
            if (actor.weapon == "shadow_dagger") extraCrt = 15;
            bool crit = rng.chance(actor.crt + extraCrt);
            if (crit) dmg = dmg * 3 / 2;
            action["crit"] = crit;
            int dealt = applyDamage(target, dmg);
            action["damage"] = dealt;
            if (stunProc) {
                target.stunned = true;
                action["stun"] = true;
            }
        } else if (actionType == "skill1") {
            actor.skill1Cd = 3;
            if (actor.charType == "knight") {
                // Shield Bash: 0.8x ATK + 15% stun
                action["type"] = "skill";
                action["skill"] = "shield_bash";
                int dmg = std::max(1, actor.atk * 4 / 5 - effectiveDef(target));
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                int dealt = applyDamage(target, dmg);
                action["damage"] = dealt;
                if (rng.chance(15)) {
                    target.stunned = true;
                    action["stun"] = true;
                }
            } else if (actor.charType == "rogue") {
                // Backstab: 1.4x if faster, 0.9x otherwise
                action["type"] = "skill";
                action["skill"] = "backstab";
                float mult = (actor.spd > target.spd) ? 1.4f : 0.9f;
                int dmg = std::max(1, static_cast<int>(actor.atk * mult) - effectiveDef(target));
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                action["damage"] = applyDamage(target, dmg);
            } else if (actor.charType == "mage") {
                // Fireball: 1.5x ATK, ignores 50% DEF
                action["type"] = "skill";
                action["skill"] = "fireball";
                int targetDef = effectiveDef(target) / 2;
                int dmg = std::max(1, actor.atk * 3 / 2 - targetDef);
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                action["damage"] = applyDamage(target, dmg);
            } else if (actor.charType == "berserker") {
                // Rage Strike: 1.2x ATK, permanent +2 ATK
                action["type"] = "skill";
                action["skill"] = "rage_strike";
                int dmg = std::max(1, actor.atk * 6 / 5 - effectiveDef(target));
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                action["damage"] = applyDamage(target, dmg);
                actor.atk += 2;
                action["atk_boost"] = 2;
            }
        } else { // skill2
            actor.skill2Cd = 3;
            if (actor.charType == "knight") {
                // Fortify: +30% DEF for 2 turns
                action["type"] = "skill";
                action["skill"] = "fortify";
                action["damage"] = 0;
                action["crit"] = false;
                actor.defBuffTurns = 2;
                actor.defBuffAmount = actor.def * 30 / 100;
                action["def_buff"] = actor.defBuffAmount;
            } else if (actor.charType == "rogue") {
                // Poison Blade: 0.6x + poison 3 turns
                action["type"] = "skill";
                action["skill"] = "poison_blade";
                int dmg = std::max(1, actor.atk * 3 / 5 - effectiveDef(target));
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                action["damage"] = applyDamage(target, dmg);
                target.poisonTurns = 3;
                action["poison"] = 3;
            } else if (actor.charType == "mage") {
                // Arcane Shield: absorb next 25 damage
                action["type"] = "skill";
                action["skill"] = "arcane_shield";
                action["damage"] = 0;
                action["crit"] = false;
                actor.absorbShield = 25;
                action["absorb"] = 25;
            } else if (actor.charType == "berserker") {
                // Blood Fury: lose 10% HP, deal 2.0x ATK
                action["type"] = "skill";
                action["skill"] = "blood_fury";
                int selfDmg = actor.hp / 10;
                actor.hp -= selfDmg;
                if (actor.hp < 1) actor.hp = 1;
                action["self_damage"] = selfDmg;
                int dmg = std::max(1, actor.atk * 2 - effectiveDef(target));
                bool crit = rng.chance(actor.crt);
                if (crit) dmg = dmg * 3 / 2;
                action["crit"] = crit;
                action["damage"] = applyDamage(target, dmg);
            }
        }
        return action;
    };

    for (int turn = 1; turn <= 30; ++turn) {
        Json::Value turnObj;
        turnObj["turn"] = turn;

        // Tick status effects at start of turn
        auto tickStatus = [&](FighterState &f, Json::Value &effects) {
            if (f.poisonTurns > 0) {
                int poisonDmg = 5;
                f.hp -= poisonDmg;
                if (f.hp < 0) f.hp = 0;
                f.poisonTurns--;
                Json::Value eff;
                eff["target"] = f.id;
                eff["type"] = "poison_tick";
                eff["damage"] = poisonDmg;
                eff["turns_left"] = f.poisonTurns;
                effects.append(eff);
            }
            if (f.defBuffTurns > 0) f.defBuffTurns--;
            if (f.skill1Cd > 0) f.skill1Cd--;
            if (f.skill2Cd > 0) f.skill2Cd--;
        };

        Json::Value effects(Json::arrayValue);
        tickStatus(f1, effects);
        tickStatus(f2, effects);
        turnObj["effects"] = effects;

        if (f1.hp <= 0 || f2.hp <= 0) {
            // Someone died from poison
            Json::Value hpAfter;
            hpAfter[f1.id] = f1.hp;
            hpAfter[f2.id] = f2.hp;
            turnObj["hp_after"] = hpAfter;
            turnObj["actions"] = Json::Value(Json::arrayValue);
            log.append(turnObj);
            break;
        }

        // Initiative
        int init1 = f1.spd + rng.range(0, f1.spd / 2);
        int init2 = f2.spd + rng.range(0, f2.spd / 2);
        if (init1 == init2) {
            // Tie-break by luck
            init1 += f1.lck;
            init2 += f2.lck;
        }

        FighterState &first = (init1 >= init2) ? f1 : f2;
        FighterState &second = (init1 >= init2) ? f2 : f1;
        turnObj["first"] = first.id;

        Json::Value actions(Json::arrayValue);

        // First fighter acts
        if (!first.stunned) {
            actions.append(doAction(first, second, rng));
        } else {
            Json::Value skip;
            skip["actor"] = first.id;
            skip["type"] = "stunned";
            skip["damage"] = 0;
            skip["dodged"] = false;
            skip["crit"] = false;
            actions.append(skip);
            first.stunned = false;
        }

        // Check if second died
        if (second.hp > 0) {
            if (!second.stunned) {
                actions.append(doAction(second, first, rng));
            } else {
                Json::Value skip;
                skip["actor"] = second.id;
                skip["type"] = "stunned";
                skip["damage"] = 0;
                skip["dodged"] = false;
                skip["crit"] = false;
                actions.append(skip);
                second.stunned = false;
            }
        }

        turnObj["actions"] = actions;

        Json::Value hpAfter;
        hpAfter[f1.id] = f1.hp;
        hpAfter[f2.id] = f2.hp;
        turnObj["hp_after"] = hpAfter;

        log.append(turnObj);

        if (f1.hp <= 0 || f2.hp <= 0) break;
    }

    return log;
}

// Determine winner from final state
std::string determineWinner(const FighterState &f1, const FighterState &f2) {
    if (f1.hp <= 0 && f2.hp <= 0) {
        // Both dead -- higher % HP remaining wins (edge case: both 0 = draw)
        return "";
    }
    if (f1.hp <= 0) return f2.id;
    if (f2.hp <= 0) return f1.id;
    // Max turns reached -- higher %HP wins
    double pct1 = static_cast<double>(f1.hp) / f1.maxHp;
    double pct2 = static_cast<double>(f2.hp) / f2.maxHp;
    if (pct1 > pct2) return f1.id;
    if (pct2 > pct1) return f2.id;
    return ""; // True draw
}

// ELO calculation
int calcEloChange(int myElo, int oppElo, bool won) {
    double expected = 1.0 / (1.0 + std::pow(10.0, (oppElo - myElo) / 400.0));
    double result = won ? 1.0 : 0.0;
    return static_cast<int>(std::round(32.0 * (result - expected)));
}

// JSON helper for fighter row
Json::Value fighterRowToJson(const Row &row) {
    Json::Value json;
    json["id"] = row["id"].as<std::string>();
    json["name"] = row["name"].as<std::string>();
    json["char_type"] = row["char_type"].as<std::string>();
    json["weapon"] = row["weapon"].as<std::string>();
    json["level"] = row["level"].as<int>();
    json["xp"] = row["xp"].as<int>();
    json["hp"] = row["hp"].as<int>();
    json["atk"] = row["atk"].as<int>();
    json["def"] = row["def"].as<int>();
    json["spd"] = row["spd"].as<int>();
    json["crt"] = row["crt"].as<int>();
    json["lck"] = row["lck"].as<int>();
    json["elo"] = row["elo"].as<int>();
    json["wins"] = row["wins"].as<int>();
    json["losses"] = row["losses"].as<int>();
    json["created_at"] = row["created_at"].as<std::string>();
    return json;
}

Json::Value errorJson(const std::string &msg) {
    Json::Value json;
    json["error"] = msg;
    return json;
}

} // namespace

// ============================================================
// Endpoints
// ============================================================

void FighterController::createFighter(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json || !json->isMember("name") || !json->isMember("char_type") ||
        !json->isMember("weapon")) {
        auto resp = HttpResponse::newHttpJsonResponse(
            errorJson("name, char_type, and weapon are required"));
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto name = (*json)["name"].asString();
    auto charType = (*json)["char_type"].asString();
    auto weapon = (*json)["weapon"].asString();

    if (kBaseStats.find(charType) == kBaseStats.end()) {
        auto resp = HttpResponse::newHttpJsonResponse(
            errorJson("invalid char_type"));
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }
    if (kWeaponBonus.find(weapon) == kWeaponBonus.end()) {
        auto resp = HttpResponse::newHttpJsonResponse(
            errorJson("invalid weapon"));
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    const auto &base = kBaseStats.at(charType);
    const auto &wpn = kWeaponBonus.at(weapon);
    int hp = base.hp;
    int atk = base.atk + wpn.atk;
    int def = base.def + wpn.def;
    int spd = base.spd + wpn.spd;
    int crt = base.crt + wpn.crt;
    int lck = base.lck;

    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(INSERT INTO fighters (name, char_type, weapon, hp, atk, def, spd, crt, lck)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, name, char_type, weapon, level, xp, hp, atk, def, spd, crt, lck,
                     elo, wins, losses, created_at)",
        [callback](const Result &r) {
            auto resp = HttpResponse::newHttpJsonResponse(fighterRowToJson(r[0]));
            resp->setStatusCode(k201Created);
            callback(resp);
        },
        [callback](const DrogonDbException &e) {
            std::string msg = e.base().what();
            Json::Value json;
            if (msg.find("unique") != std::string::npos ||
                msg.find("duplicate") != std::string::npos) {
                json["error"] = "name already taken";
                auto resp = HttpResponse::newHttpJsonResponse(json);
                resp->setStatusCode(k409Conflict);
                callback(resp);
            } else {
                json["error"] = msg;
                auto resp = HttpResponse::newHttpJsonResponse(json);
                resp->setStatusCode(k500InternalServerError);
                callback(resp);
            }
        },
        name, charType, weapon, hp, atk, def, spd, crt, lck);
}

void FighterController::getFighter(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def, spd, crt, lck,
                  elo, wins, losses, created_at
           FROM fighters WHERE id = $1)",
        [callback](const Result &r) {
            if (r.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(errorJson("not found"));
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            callback(HttpResponse::newHttpJsonResponse(fighterRowToJson(r[0])));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void FighterController::lookupFighter(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &name)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def, spd, crt, lck,
                  elo, wins, losses, created_at
           FROM fighters WHERE LOWER(name) = LOWER($1))",
        [callback](const Result &r) {
            if (r.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(errorJson("not found"));
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            callback(HttpResponse::newHttpJsonResponse(fighterRowToJson(r[0])));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        name);
}

void FighterController::battle(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto json = req->getJsonObject();
    auto db = app().getDbClient();

    // First fetch the challenger
    db->execSqlAsync(
        R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def, spd, crt, lck,
                  elo, wins, losses
           FROM fighters WHERE id = $1)",
        [callback, json, db](const Result &r1) {
            if (r1.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(errorJson("fighter not found"));
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }

            // Determine opponent
            std::string oppQuery;
            std::string oppParam;

            if (json && json->isMember("opponent_id")) {
                oppParam = (*json)["opponent_id"].asString();
                oppQuery = R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def,
                                     spd, crt, lck, elo, wins, losses
                              FROM fighters WHERE id = $1)";
            } else {
                // Random opponent (not self)
                oppParam = r1[0]["id"].as<std::string>();
                oppQuery = R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def,
                                     spd, crt, lck, elo, wins, losses
                              FROM fighters WHERE id != $1
                              ORDER BY RANDOM() LIMIT 1)";
            }

            // Capture fighter1 data
            auto f1Id = r1[0]["id"].as<std::string>();
            auto f1Name = r1[0]["name"].as<std::string>();
            auto f1Type = r1[0]["char_type"].as<std::string>();
            auto f1Weapon = r1[0]["weapon"].as<std::string>();
            int f1Hp = r1[0]["hp"].as<int>();
            int f1Atk = r1[0]["atk"].as<int>();
            int f1Def = r1[0]["def"].as<int>();
            int f1Spd = r1[0]["spd"].as<int>();
            int f1Crt = r1[0]["crt"].as<int>();
            int f1Lck = r1[0]["lck"].as<int>();
            int f1Elo = r1[0]["elo"].as<int>();
            int f1Xp = r1[0]["xp"].as<int>();
            int f1Level = r1[0]["level"].as<int>();
            int f1Wins = r1[0]["wins"].as<int>();
            int f1Losses = r1[0]["losses"].as<int>();

            db->execSqlAsync(
                oppQuery,
                [=](const Result &r2) {
                    if (r2.empty()) {
                        auto resp = HttpResponse::newHttpJsonResponse(
                            errorJson("no opponent found"));
                        resp->setStatusCode(k404NotFound);
                        callback(resp);
                        return;
                    }

                    auto f2Id = r2[0]["id"].as<std::string>();
                    if (f2Id == f1Id) {
                        auto resp = HttpResponse::newHttpJsonResponse(
                            errorJson("cannot battle yourself"));
                        resp->setStatusCode(k400BadRequest);
                        callback(resp);
                        return;
                    }

                    // Build fighter states
                    FighterState fs1;
                    fs1.id = f1Id; fs1.name = f1Name; fs1.charType = f1Type;
                    fs1.weapon = f1Weapon;
                    fs1.hp = f1Hp; fs1.maxHp = f1Hp;
                    fs1.atk = f1Atk; fs1.def = f1Def; fs1.spd = f1Spd;
                    fs1.crt = f1Crt; fs1.lck = f1Lck;

                    FighterState fs2;
                    fs2.id = f2Id;
                    fs2.name = r2[0]["name"].as<std::string>();
                    fs2.charType = r2[0]["char_type"].as<std::string>();
                    fs2.weapon = r2[0]["weapon"].as<std::string>();
                    fs2.hp = r2[0]["hp"].as<int>(); fs2.maxHp = fs2.hp;
                    fs2.atk = r2[0]["atk"].as<int>();
                    fs2.def = r2[0]["def"].as<int>();
                    fs2.spd = r2[0]["spd"].as<int>();
                    fs2.crt = r2[0]["crt"].as<int>();
                    fs2.lck = r2[0]["lck"].as<int>();

                    int f2Elo = r2[0]["elo"].as<int>();
                    int f2Xp = r2[0]["xp"].as<int>();
                    int f2Level = r2[0]["level"].as<int>();
                    int f2Wins = r2[0]["wins"].as<int>();
                    int f2Losses = r2[0]["losses"].as<int>();

                    // Generate seed and run combat
                    std::random_device rd;
                    uint32_t seed = rd();
                    Json::Value battleLog = runCombat(fs1, fs2, seed);

                    std::string winnerId = determineWinner(fs1, fs2);

                    // ELO
                    bool f1Won = (winnerId == f1Id);
                    bool f2Won = (winnerId == f2Id);
                    int eloChange = calcEloChange(f1Elo, f2Elo, f1Won);

                    int newF1Elo = f1Elo + eloChange;
                    int newF2Elo = f2Elo - eloChange;
                    if (newF1Elo < 0) newF1Elo = 0;
                    if (newF2Elo < 0) newF2Elo = 0;

                    // XP
                    int f1XpGain = f1Won ? 20 : 5;
                    int f2XpGain = f2Won ? 20 : 5;
                    int newF1Xp = f1Xp + f1XpGain;
                    int newF2Xp = f2Xp + f2XpGain;

                    // Level up check
                    int newF1Level = f1Level;
                    while (newF1Level < 20 && newF1Xp >= newF1Level * 50) {
                        newF1Xp -= newF1Level * 50;
                        newF1Level++;
                    }
                    int newF2Level = f2Level;
                    while (newF2Level < 20 && newF2Xp >= newF2Level * 50) {
                        newF2Xp -= newF2Level * 50;
                        newF2Level++;
                    }

                    // Compute stat boosts from level-ups
                    int f1LevelUps = newF1Level - f1Level;
                    int f2LevelUps = newF2Level - f2Level;
                    int f1HpBoost = f1LevelUps * 2;
                    int f2HpBoost = f2LevelUps * 2;

                    // Update fighter 1
                    auto updateDb = app().getDbClient();
                    updateDb->execSqlAsync(
                        R"(UPDATE fighters SET elo=$1, xp=$2, level=$3,
                              wins=wins+$4, losses=losses+$5, hp=hp+$6
                           WHERE id=$7)",
                        [](const Result &) {},
                        [](const DrogonDbException &) {},
                        newF1Elo, newF1Xp, newF1Level,
                        (f1Won ? 1 : 0), (f1Won ? 0 : 1),
                        f1HpBoost, f1Id);

                    // Update fighter 2
                    updateDb->execSqlAsync(
                        R"(UPDATE fighters SET elo=$1, xp=$2, level=$3,
                              wins=wins+$4, losses=losses+$5, hp=hp+$6
                           WHERE id=$7)",
                        [](const Result &) {},
                        [](const DrogonDbException &) {},
                        newF2Elo, newF2Xp, newF2Level,
                        (f2Won ? 1 : 0), (f2Won ? 0 : 1),
                        f2HpBoost, f2Id);

                    // Store battle log as string for JSONB
                    Json::StreamWriterBuilder wb;
                    wb["indentation"] = "";
                    std::string logStr = Json::writeString(wb, battleLog);

                    // Insert match
                    updateDb->execSqlAsync(
                        R"(INSERT INTO matches (fighter1_id, fighter2_id, winner_id, seed,
                                               battle_log, elo_change)
                           VALUES ($1, $2, $3, $4, $5::jsonb, $6)
                           RETURNING id, fought_at)",
                        [=](const Result &mr) {
                            Json::Value resp;
                            resp["match_id"] = mr[0]["id"].as<std::string>();
                            resp["fought_at"] = mr[0]["fought_at"].as<std::string>();
                            resp["winner_id"] = winnerId;
                            resp["elo_change"] = eloChange;
                            resp["battle_log"] = battleLog;

                            // Fighter snapshots
                            Json::Value f1Json;
                            f1Json["id"] = f1Id;
                            f1Json["name"] = f1Name;
                            f1Json["char_type"] = f1Type;
                            f1Json["weapon"] = f1Weapon;
                            f1Json["hp"] = f1Hp;
                            f1Json["atk"] = f1Atk;
                            f1Json["def"] = f1Def;
                            f1Json["spd"] = f1Spd;

                            Json::Value f2Json;
                            f2Json["id"] = f2Id;
                            f2Json["name"] = fs2.name;
                            f2Json["char_type"] = fs2.charType;
                            f2Json["weapon"] = fs2.weapon;
                            f2Json["hp"] = fs2.maxHp;
                            f2Json["atk"] = r2[0]["atk"].as<int>();
                            f2Json["def"] = r2[0]["def"].as<int>();
                            f2Json["spd"] = r2[0]["spd"].as<int>();

                            resp["fighter1"] = f1Json;
                            resp["fighter2"] = f2Json;

                            auto httpResp = HttpResponse::newHttpJsonResponse(resp);
                            httpResp->setStatusCode(k201Created);
                            callback(httpResp);
                        },
                        [callback](const DrogonDbException &e) {
                            auto resp = HttpResponse::newHttpJsonResponse(
                                errorJson(e.base().what()));
                            resp->setStatusCode(k500InternalServerError);
                            callback(resp);
                        },
                        f1Id, f2Id,
                        winnerId.empty() ? std::string() : winnerId,
                        static_cast<int64_t>(seed), logStr,
                        std::abs(eloChange));
                },
                [callback](const DrogonDbException &e) {
                    auto resp = HttpResponse::newHttpJsonResponse(
                        errorJson(e.base().what()));
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                },
                oppParam);
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void FighterController::getMatch(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT m.id, m.fighter1_id, m.fighter2_id, m.winner_id, m.seed,
                  m.battle_log, m.elo_change, m.fought_at,
                  f1.name AS f1_name, f1.char_type AS f1_type, f1.weapon AS f1_weapon,
                  f1.hp AS f1_hp, f1.atk AS f1_atk, f1.def AS f1_def, f1.spd AS f1_spd,
                  f2.name AS f2_name, f2.char_type AS f2_type, f2.weapon AS f2_weapon,
                  f2.hp AS f2_hp, f2.atk AS f2_atk, f2.def AS f2_def, f2.spd AS f2_spd
           FROM matches m
           JOIN fighters f1 ON f1.id = m.fighter1_id
           JOIN fighters f2 ON f2.id = m.fighter2_id
           WHERE m.id = $1)",
        [callback](const Result &r) {
            if (r.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(errorJson("not found"));
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            Json::Value json;
            json["match_id"] = r[0]["id"].as<std::string>();
            json["winner_id"] = r[0]["winner_id"].isNull()
                ? "" : r[0]["winner_id"].as<std::string>();
            json["elo_change"] = r[0]["elo_change"].as<int>();
            json["fought_at"] = r[0]["fought_at"].as<std::string>();

            // Parse battle_log JSONB
            Json::CharReaderBuilder rb;
            std::string errs;
            auto logStr = r[0]["battle_log"].as<std::string>();
            Json::Value battleLog;
            std::istringstream ss(logStr);
            Json::parseFromStream(rb, ss, &battleLog, &errs);
            json["battle_log"] = battleLog;

            Json::Value f1;
            f1["id"] = r[0]["fighter1_id"].as<std::string>();
            f1["name"] = r[0]["f1_name"].as<std::string>();
            f1["char_type"] = r[0]["f1_type"].as<std::string>();
            f1["weapon"] = r[0]["f1_weapon"].as<std::string>();
            f1["hp"] = r[0]["f1_hp"].as<int>();
            f1["atk"] = r[0]["f1_atk"].as<int>();
            f1["def"] = r[0]["f1_def"].as<int>();
            f1["spd"] = r[0]["f1_spd"].as<int>();
            json["fighter1"] = f1;

            Json::Value f2;
            f2["id"] = r[0]["fighter2_id"].as<std::string>();
            f2["name"] = r[0]["f2_name"].as<std::string>();
            f2["char_type"] = r[0]["f2_type"].as<std::string>();
            f2["weapon"] = r[0]["f2_weapon"].as<std::string>();
            f2["hp"] = r[0]["f2_hp"].as<int>();
            f2["atk"] = r[0]["f2_atk"].as<int>();
            f2["def"] = r[0]["f2_def"].as<int>();
            f2["spd"] = r[0]["f2_spd"].as<int>();
            json["fighter2"] = f2;

            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void FighterController::getFighterMatches(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT m.id, m.fighter1_id, m.fighter2_id, m.winner_id,
                  m.elo_change, m.fought_at,
                  f1.name AS f1_name, f1.char_type AS f1_type,
                  f2.name AS f2_name, f2.char_type AS f2_type
           FROM matches m
           JOIN fighters f1 ON f1.id = m.fighter1_id
           JOIN fighters f2 ON f2.id = m.fighter2_id
           WHERE m.fighter1_id = $1 OR m.fighter2_id = $1
           ORDER BY m.fought_at DESC LIMIT 20)",
        [callback](const Result &r) {
            Json::Value arr(Json::arrayValue);
            for (const auto &row : r) {
                Json::Value obj;
                obj["match_id"] = row["id"].as<std::string>();
                obj["fighter1_id"] = row["fighter1_id"].as<std::string>();
                obj["fighter2_id"] = row["fighter2_id"].as<std::string>();
                obj["f1_name"] = row["f1_name"].as<std::string>();
                obj["f2_name"] = row["f2_name"].as<std::string>();
                obj["f1_type"] = row["f1_type"].as<std::string>();
                obj["f2_type"] = row["f2_type"].as<std::string>();
                obj["winner_id"] = row["winner_id"].isNull()
                    ? "" : row["winner_id"].as<std::string>();
                obj["elo_change"] = row["elo_change"].as<int>();
                obj["fought_at"] = row["fought_at"].as<std::string>();
                arr.append(obj);
            }
            callback(HttpResponse::newHttpJsonResponse(arr));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void FighterController::leaderboard(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT id, name, char_type, weapon, level, elo, wins, losses
           FROM fighters ORDER BY elo DESC LIMIT 50)",
        [callback](const Result &r) {
            Json::Value arr(Json::arrayValue);
            for (const auto &row : r) {
                Json::Value obj;
                obj["id"] = row["id"].as<std::string>();
                obj["name"] = row["name"].as<std::string>();
                obj["char_type"] = row["char_type"].as<std::string>();
                obj["weapon"] = row["weapon"].as<std::string>();
                obj["level"] = row["level"].as<int>();
                obj["elo"] = row["elo"].as<int>();
                obj["wins"] = row["wins"].as<int>();
                obj["losses"] = row["losses"].as<int>();
                arr.append(obj);
            }
            callback(HttpResponse::newHttpJsonResponse(arr));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        });
}

void FighterController::listFighters(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT id, name, char_type, weapon, level, xp, hp, atk, def, spd, crt, lck,
                  elo, wins, losses, created_at
           FROM fighters ORDER BY created_at DESC)",
        [callback](const Result &r) {
            Json::Value arr(Json::arrayValue);
            for (const auto &row : r) {
                arr.append(fighterRowToJson(row));
            }
            callback(HttpResponse::newHttpJsonResponse(arr));
        },
        [callback](const DrogonDbException &e) {
            auto resp = HttpResponse::newHttpJsonResponse(errorJson(e.base().what()));
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        });
}
