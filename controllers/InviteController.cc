#include "InviteController.h"
#include <drogon/orm/DbClient.h>
#include <thread>
#include <cstdlib>

namespace {
void sendRsvpNotification(const std::string &guestName, bool attending,
                          int numGuests, const std::string &invitationId,
                          const std::string &guestEmail) {
    std::string status = attending ? "ACCEPTED" : "DECLINED";
    std::string statusColor = attending ? "#7ec88b" : "#e74c3c";
    std::string emoji = attending ? "YEE-HAW! \xF0\x9F\xA4\xA0" : "Aw shucks... \xF0\x9F\x98\xA2";
    std::string subject = "RSVP " + status + " - " + guestName;

    std::string html = R"(
<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
  <div style="background:#1a1a3e;color:#f5d76e;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="margin:0;font-size:24px;">A Boy Story</h1>
    <p style="margin:4px 0 0;color:#a8d4f0;font-size:12px;">RSVP Notification</p>
  </div>
  <div style="background:#f0f7ff;padding:24px;border:2px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
    <h2 style="color:)" + statusColor + R"(;margin:0 0 16px;">)" + emoji + R"(</h2>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#999;">Guest</td><td style="padding:8px 0;font-weight:bold;">)" + guestName + R"(</td></tr>
      <tr><td style="padding:8px 0;color:#999;">Status</td><td style="padding:8px 0;font-weight:bold;color:)" + statusColor + R"(;">)" + status + R"(</td></tr>
      <tr><td style="padding:8px 0;color:#999;">Guests</td><td style="padding:8px 0;font-weight:bold;">)" + std::to_string(numGuests) + R"(</td></tr>
      <tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;">)" + (guestEmail.empty() ? "<em>not provided</em>" : guestEmail) + R"(</td></tr>
      <tr><td style="padding:8px 0;color:#999;">Invite ID</td><td style="padding:8px 0;font-family:monospace;">)" + invitationId + R"(</td></tr>
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://andyamat.com/admin" style="background:#f5d76e;color:#6B4F10;padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">View All RSVPs</a>
    </div>
  </div>
</div>)";

    auto sendTo = [&](const std::string &to) {
        std::string tmpFile = "/tmp/andyamat_email_" + invitationId + "_" + to + ".json";
        std::string msgJson = R"({"Subject":{"Data":")" + subject + R"("},"Body":{"Html":{"Data":")" +
            [&]() {
                std::string escaped;
                for (char c : html) {
                    if (c == '"') escaped += "\\\"";
                    else if (c == '\n') escaped += "";
                    else escaped += c;
                }
                return escaped;
            }() + R"("}}})";

        FILE *f = fopen(tmpFile.c_str(), "w");
        if (f) {
            fputs(msgJson.c_str(), f);
            fclose(f);
        }

        std::string cmd =
            "aws ses send-email"
            " --from 'Baby Andy <no_reply@andyamat.com>'"
            " --destination 'ToAddresses=" + to + "'"
            " --message file://" + tmpFile +
            " --region us-east-1 >/dev/null 2>&1;"
            " rm -f " + tmpFile + " &";
        system(cmd.c_str());
    };

    sendTo("aamatreyes@gmail.com");
    sendTo("sabrinaelizabeth65@gmail.com");
}
} // namespace

using namespace drogon;
using namespace drogon::orm;

void InviteController::getInvite(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        "SELECT id, guest_name, plus_ones, created_at FROM invitations WHERE id = $1",
        [callback](const Result &r) {
            if (r.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(
                    Json::Value{Json::objectValue});
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            Json::Value json;
            json["id"] = r[0]["id"].as<std::string>();
            json["guest_name"] = r[0]["guest_name"].as<std::string>();
            json["plus_ones"] = r[0]["plus_ones"].as<int>();
            json["created_at"] = r[0]["created_at"].as<std::string>();
            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void InviteController::createInvite(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json || !json->isMember("guest_name")) {
        auto resp = HttpResponse::newHttpJsonResponse(
            Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto guestName = (*json)["guest_name"].asString();
    auto poVal = json->get("plus_ones", 0);
    int plusOnes = poVal.isString() ? std::stoi(poVal.asString()) : poVal.asInt();
    auto theme = json->get("theme", "toystory").asString();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO invitations (guest_name, plus_ones, theme) VALUES ($1, $2, $3) RETURNING id, guest_name, plus_ones, theme, created_at",
        [callback](const Result &r) {
            Json::Value json;
            json["id"] = r[0]["id"].as<std::string>();
            json["guest_name"] = r[0]["guest_name"].as<std::string>();
            json["plus_ones"] = r[0]["plus_ones"].as<int>();
            json["theme"] = r[0]["theme"].as<std::string>();
            json["created_at"] = r[0]["created_at"].as<std::string>();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k201Created);
            callback(resp);
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        guestName, plusOnes, theme);
}

void InviteController::listInvites(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT i.id, i.guest_name, i.plus_ones, i.theme, i.created_at,
                  COUNT(DISTINCT v.id) AS view_count,
                  r.attending, r.name AS rsvp_name, r.num_guests, r.submitted_at
           FROM invitations i
           LEFT JOIN invite_views v ON v.invitation_id = i.id
           LEFT JOIN rsvps r ON r.invitation_id = i.id
           GROUP BY i.id, i.theme, r.attending, r.name, r.num_guests, r.submitted_at
           ORDER BY i.created_at DESC)",
        [callback](const Result &r) {
            Json::Value arr(Json::arrayValue);
            for (const auto &row : r) {
                Json::Value obj;
                obj["id"] = row["id"].as<std::string>();
                obj["guest_name"] = row["guest_name"].as<std::string>();
                obj["plus_ones"] = row["plus_ones"].as<int>();
                obj["theme"] = row["theme"].isNull() ? "toystory" : row["theme"].as<std::string>();
                obj["created_at"] = row["created_at"].as<std::string>();
                obj["view_count"] = row["view_count"].as<int>();
                if (!row["rsvp_name"].isNull()) {
                    obj["rsvp_name"] = row["rsvp_name"].as<std::string>();
                    obj["attending"] = row["attending"].as<bool>();
                    obj["num_guests"] = row["num_guests"].as<int>();
                    obj["submitted_at"] = row["submitted_at"].as<std::string>();
                }
                arr.append(obj);
            }
            callback(HttpResponse::newHttpJsonResponse(arr));
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        });
}

void InviteController::recordView(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    auto ua = req->getHeader("User-Agent");
    auto ip = req->peerAddr().toIp();

    db->execSqlAsync(
        "INSERT INTO invite_views (invitation_id, user_agent, ip_address) VALUES ($1, $2, $3)",
        [callback](const Result &) {
            Json::Value json;
            json["ok"] = true;
            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id, ua, ip);
}

void InviteController::submitRsvp(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json || !json->isMember("invitation_id") || !json->isMember("name") ||
        !json->isMember("attending")) {
        auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto invId = (*json)["invitation_id"].asString();
    auto name = (*json)["name"].asString();
    auto attending = (*json)["attending"].asBool();
    auto ngVal = json->get("num_guests", 1);
    int numGuests = ngVal.isString() ? std::stoi(ngVal.asString()) : ngVal.asInt();
    auto guestEmail = json->get("guest_email", "").asString();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO rsvps (invitation_id, name, num_guests, attending, guest_email) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (invitation_id) DO UPDATE SET name = EXCLUDED.name, num_guests = EXCLUDED.num_guests, attending = EXCLUDED.attending, guest_email = COALESCE(NULLIF(EXCLUDED.guest_email, ''), rsvps.guest_email), submitted_at = NOW() RETURNING id",
        [callback, name, attending, numGuests, invId, guestEmail](const Result &r) {
            Json::Value json;
            json["ok"] = true;
            json["rsvp_id"] = r[0]["id"].as<int>();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k201Created);
            callback(resp);

            std::thread(sendRsvpNotification, name, attending, numGuests, invId, guestEmail).detach();
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        invId, name, numGuests, attending, guestEmail);
}

void InviteController::updateInvite(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto guestName = json->get("guest_name", "").asString();
    auto poVal = json->get("plus_ones", 0);
    int plusOnes = poVal.isString() ? std::stoi(poVal.asString()) : poVal.asInt();
    auto theme = json->get("theme", "toystory").asString();

    if (guestName.empty()) {
        Json::Value err;
        err["error"] = "guest_name is required";
        auto resp = HttpResponse::newHttpJsonResponse(err);
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto db = app().getDbClient();
    db->execSqlAsync(
        "UPDATE invitations SET guest_name = $1, plus_ones = $2, theme = $3 WHERE id = $4 RETURNING id, guest_name, plus_ones, theme, created_at",
        [callback](const Result &r) {
            if (r.empty()) {
                auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
                resp->setStatusCode(k404NotFound);
                callback(resp);
                return;
            }
            Json::Value json;
            json["id"] = r[0]["id"].as<std::string>();
            json["guest_name"] = r[0]["guest_name"].as<std::string>();
            json["plus_ones"] = r[0]["plus_ones"].as<int>();
            json["theme"] = r[0]["theme"].as<std::string>();
            json["created_at"] = r[0]["created_at"].as<std::string>();
            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        guestName, plusOnes, theme, id);
}

void InviteController::adminUpdateRsvp(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto json = req->getJsonObject();
    if (!json) {
        auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    bool hasAttending = json->isMember("attending");
    bool hasNumGuests = json->isMember("num_guests");
    if (!hasAttending && !hasNumGuests) {
        auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    bool attending = hasAttending ? (*json)["attending"].asBool() : true;
    int numGuests = hasNumGuests ? (*json)["num_guests"].asInt() : 1;
    auto db = app().getDbClient();

    db->execSqlAsync(
        "SELECT id, attending, num_guests FROM rsvps WHERE invitation_id = $1",
        [db, callback, id, attending, numGuests, hasAttending, hasNumGuests](const Result &r) {
            if (r.empty()) {
                db->execSqlAsync(
                    R"(INSERT INTO rsvps (invitation_id, name, num_guests, attending)
                       SELECT $1, i.guest_name, $2, $3 FROM invitations i WHERE i.id = $1
                       RETURNING id)",
                    [callback](const Result &r2) {
                        if (r2.empty()) {
                            Json::Value json;
                            json["error"] = "Invitation not found";
                            auto resp = HttpResponse::newHttpJsonResponse(json);
                            resp->setStatusCode(k404NotFound);
                            callback(resp);
                            return;
                        }
                        Json::Value json;
                        json["ok"] = true;
                        callback(HttpResponse::newHttpJsonResponse(json));
                    },
                    [callback](const DrogonDbException &e) {
                        Json::Value json;
                        json["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(json);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    id, numGuests, attending);
            } else {
                bool finalAttending = hasAttending ? attending : r[0]["attending"].as<bool>();
                int finalGuests = hasNumGuests ? numGuests : r[0]["num_guests"].as<int>();
                db->execSqlAsync(
                    "UPDATE rsvps SET attending = $1, num_guests = $2 WHERE invitation_id = $3",
                    [callback](const Result &) {
                        Json::Value json;
                        json["ok"] = true;
                        callback(HttpResponse::newHttpJsonResponse(json));
                    },
                    [callback](const DrogonDbException &e) {
                        Json::Value json;
                        json["error"] = e.base().what();
                        auto resp = HttpResponse::newHttpJsonResponse(json);
                        resp->setStatusCode(k500InternalServerError);
                        callback(resp);
                    },
                    finalAttending, finalGuests, id);
            }
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void InviteController::deleteInvite(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    const std::string &id)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        "DELETE FROM invite_views WHERE invitation_id = $1",
        [db, callback, id](const Result &) {
            db->execSqlAsync(
                "DELETE FROM rsvps WHERE invitation_id = $1",
                [db, callback, id](const Result &) {
                    db->execSqlAsync(
                        "DELETE FROM invitations WHERE id = $1 RETURNING id",
                        [callback](const Result &r) {
                            if (r.empty()) {
                                Json::Value json;
                                json["error"] = "Invitation not found";
                                auto resp = HttpResponse::newHttpJsonResponse(json);
                                resp->setStatusCode(k404NotFound);
                                callback(resp);
                                return;
                            }
                            Json::Value json;
                            json["ok"] = true;
                            callback(HttpResponse::newHttpJsonResponse(json));
                        },
                        [callback](const DrogonDbException &e) {
                            Json::Value json;
                            json["error"] = e.base().what();
                            auto resp = HttpResponse::newHttpJsonResponse(json);
                            resp->setStatusCode(k500InternalServerError);
                            callback(resp);
                        },
                        id);
                },
                [callback](const DrogonDbException &e) {
                    Json::Value json;
                    json["error"] = e.base().what();
                    auto resp = HttpResponse::newHttpJsonResponse(json);
                    resp->setStatusCode(k500InternalServerError);
                    callback(resp);
                },
                id);
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        id);
}

void InviteController::updateRsvpEmail(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json || !json->isMember("invitation_id") || !json->isMember("guest_email")) {
        auto resp = HttpResponse::newHttpJsonResponse(Json::Value{Json::objectValue});
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto invId = (*json)["invitation_id"].asString();
    auto email = (*json)["guest_email"].asString();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "UPDATE rsvps SET guest_email = $1 WHERE invitation_id = $2",
        [callback](const Result &) {
            Json::Value json;
            json["ok"] = true;
            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            Json::Value json;
            json["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(json);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        email, invId);
}
