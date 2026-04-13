#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

class FighterController : public HttpController<FighterController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(FighterController::createFighter, "/api/fighters", Post);
    ADD_METHOD_TO(FighterController::getFighter, "/api/fighters/{id}", Get);
    ADD_METHOD_TO(FighterController::lookupFighter, "/api/fighters/lookup/{name}", Get);
    ADD_METHOD_TO(FighterController::battle, "/api/fighters/{id}/battle", Post);
    ADD_METHOD_TO(FighterController::getMatch, "/api/matches/{id}", Get);
    ADD_METHOD_TO(FighterController::getFighterMatches, "/api/fighters/{id}/matches", Get);
    ADD_METHOD_TO(FighterController::leaderboard, "/api/leaderboard", Get);
    ADD_METHOD_TO(FighterController::searchFighters, "/api/fighters/search", Get);
    ADD_METHOD_TO(FighterController::listFighters, "/api/admin/fighters", Get, "AdminFilter");
    METHOD_LIST_END

    void createFighter(const HttpRequestPtr &req,
                       std::function<void(const HttpResponsePtr &)> &&callback);

    void getFighter(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback,
                    const std::string &id);

    void lookupFighter(const HttpRequestPtr &req,
                       std::function<void(const HttpResponsePtr &)> &&callback,
                       const std::string &name);

    void battle(const HttpRequestPtr &req,
                std::function<void(const HttpResponsePtr &)> &&callback,
                const std::string &id);

    void getMatch(const HttpRequestPtr &req,
                  std::function<void(const HttpResponsePtr &)> &&callback,
                  const std::string &id);

    void getFighterMatches(const HttpRequestPtr &req,
                           std::function<void(const HttpResponsePtr &)> &&callback,
                           const std::string &id);

    void leaderboard(const HttpRequestPtr &req,
                     std::function<void(const HttpResponsePtr &)> &&callback);

    void searchFighters(const HttpRequestPtr &req,
                        std::function<void(const HttpResponsePtr &)> &&callback);

    void listFighters(const HttpRequestPtr &req,
                      std::function<void(const HttpResponsePtr &)> &&callback);
};
