#include "AuthController.h"
#include <drogon/orm/DbClient.h>

using namespace drogon;
using namespace drogon::orm;

void AuthController::login(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto json = req->getJsonObject();
    if (!json || !json->isMember("username") || !json->isMember("password")) {
        Json::Value err;
        err["error"] = "Username and password required";
        auto resp = HttpResponse::newHttpJsonResponse(err);
        resp->setStatusCode(k400BadRequest);
        callback(resp);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();

    auto db = app().getDbClient();
    db->execSqlAsync(
        "SELECT id, username FROM admin_users WHERE username = $1 AND password_hash = crypt($2, password_hash)",
        [callback, req](const Result &r) {
            if (r.empty()) {
                Json::Value err;
                err["error"] = "Invalid credentials";
                auto resp = HttpResponse::newHttpJsonResponse(err);
                resp->setStatusCode(k401Unauthorized);
                callback(resp);
                return;
            }
            auto session = req->session();
            session->insert("admin", true);
            session->insert("username", r[0]["username"].as<std::string>());

            Json::Value json;
            json["ok"] = true;
            json["username"] = r[0]["username"].as<std::string>();
            callback(HttpResponse::newHttpJsonResponse(json));
        },
        [callback](const DrogonDbException &e) {
            Json::Value err;
            err["error"] = e.base().what();
            auto resp = HttpResponse::newHttpJsonResponse(err);
            resp->setStatusCode(k500InternalServerError);
            callback(resp);
        },
        username, password);
}

void AuthController::logout(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto session = req->session();
    if (session) {
        session->erase("admin");
        session->erase("username");
    }
    Json::Value json;
    json["ok"] = true;
    callback(HttpResponse::newHttpJsonResponse(json));
}

void AuthController::me(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback)
{
    auto session = req->session();
    if (session && session->getOptional<bool>("admin").value_or(false)) {
        Json::Value json;
        json["authenticated"] = true;
        json["username"] = session->get<std::string>("username");
        callback(HttpResponse::newHttpJsonResponse(json));
    } else {
        Json::Value json;
        json["authenticated"] = false;
        auto resp = HttpResponse::newHttpJsonResponse(json);
        resp->setStatusCode(k401Unauthorized);
        callback(resp);
    }
}
