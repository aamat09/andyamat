#include "InviteController.h"
#include <drogon/orm/DbClient.h>

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
    int plusOnes = json->get("plus_ones", 0).asInt();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO invitations (guest_name, plus_ones) VALUES ($1, $2) RETURNING id, guest_name, plus_ones, created_at",
        [callback](const Result &r) {
            Json::Value json;
            json["id"] = r[0]["id"].as<std::string>();
            json["guest_name"] = r[0]["guest_name"].as<std::string>();
            json["plus_ones"] = r[0]["plus_ones"].as<int>();
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
        guestName, plusOnes);
}

void InviteController::listInvites(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto db = app().getDbClient();
    db->execSqlAsync(
        R"(SELECT i.id, i.guest_name, i.plus_ones, i.created_at,
                  COUNT(DISTINCT v.id) AS view_count,
                  r.attending, r.name AS rsvp_name, r.num_guests, r.submitted_at
           FROM invitations i
           LEFT JOIN invite_views v ON v.invitation_id = i.id
           LEFT JOIN rsvps r ON r.invitation_id = i.id
           GROUP BY i.id, r.attending, r.name, r.num_guests, r.submitted_at
           ORDER BY i.created_at DESC)",
        [callback](const Result &r) {
            Json::Value arr(Json::arrayValue);
            for (const auto &row : r) {
                Json::Value obj;
                obj["id"] = row["id"].as<std::string>();
                obj["guest_name"] = row["guest_name"].as<std::string>();
                obj["plus_ones"] = row["plus_ones"].as<int>();
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
    int numGuests = json->get("num_guests", 1).asInt();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "INSERT INTO rsvps (invitation_id, name, num_guests, attending) VALUES ($1, $2, $3, $4) RETURNING id",
        [callback](const Result &r) {
            Json::Value json;
            json["ok"] = true;
            json["rsvp_id"] = r[0]["id"].as<int>();
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
        invId, name, numGuests, attending);
}
