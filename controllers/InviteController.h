#pragma once
#include <drogon/HttpController.h>

using namespace drogon;

class InviteController : public HttpController<InviteController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(InviteController::getInvite, "/api/invites/{id}", Get);
    ADD_METHOD_TO(InviteController::createInvite, "/api/invites", Post, "AdminFilter");
    ADD_METHOD_TO(InviteController::listInvites, "/api/admin/invites", Get, "AdminFilter");
    ADD_METHOD_TO(InviteController::recordView, "/api/invites/{id}/view", Post);
    ADD_METHOD_TO(InviteController::submitRsvp, "/api/rsvp", Post);
    ADD_METHOD_TO(InviteController::updateRsvpEmail, "/api/rsvp/email", Post);
    ADD_METHOD_TO(InviteController::updateInvite, "/api/invites/{id}", Put, "AdminFilter");
    METHOD_LIST_END

    void getInvite(const HttpRequestPtr &req,
                   std::function<void(const HttpResponsePtr &)> &&callback,
                   const std::string &id);

    void createInvite(const HttpRequestPtr &req,
                      std::function<void(const HttpResponsePtr &)> &&callback);

    void listInvites(const HttpRequestPtr &req,
                     std::function<void(const HttpResponsePtr &)> &&callback);

    void recordView(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback,
                    const std::string &id);

    void submitRsvp(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback);

    void updateRsvpEmail(const HttpRequestPtr &req,
                         std::function<void(const HttpResponsePtr &)> &&callback);

    void updateInvite(const HttpRequestPtr &req,
                      std::function<void(const HttpResponsePtr &)> &&callback,
                      const std::string &id);
};
