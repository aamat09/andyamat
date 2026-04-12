#include <drogon/drogon.h>
#include <fstream>
#include <string>

int main() {
    drogon::app().loadConfigFile("./config.json");

    // SPA fallback: intercept 404s for non-API routes, serve index.html with 200
    drogon::app().setCustomErrorHandler(
        [](drogon::HttpStatusCode code, const drogon::HttpRequestPtr &req)
            -> drogon::HttpResponsePtr {
            if (code == drogon::k404NotFound) {
                auto path = req->path();
                if (path.find("/api/") != 0) {
                    auto resp = drogon::HttpResponse::newFileResponse(
                        "./frontend/dist/web/browser/index.html",
                        "",
                        drogon::CT_TEXT_HTML);
                    resp->setStatusCode(drogon::k200OK);
                    return resp;
                }
            }
            // Default error response for API routes
            auto resp = drogon::HttpResponse::newHttpResponse();
            resp->setStatusCode(code);
            return resp;
        });

    drogon::app().run();
    return 0;
}
