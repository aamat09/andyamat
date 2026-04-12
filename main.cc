#include <drogon/drogon.h>
#include <fstream>
#include <string>

int main() {
    drogon::app().loadConfigFile("./config.json");

    // Read index.html into memory for SPA fallback
    std::string indexPath = "./frontend/dist/web/browser/index.html";

    // SPA: custom 404 page serves index.html (for when static files aren't found)
    drogon::app().setCustom404Page(
        drogon::HttpResponse::newFileResponse(indexPath, "", drogon::CT_TEXT_HTML),
        true);

    // Override the 404 status to 200 for SPA routes via post-handling advice
    drogon::app().registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr &req, const drogon::HttpResponsePtr &resp) {
            // If it's a 404 and NOT an /api/ route, it's a SPA route — set to 200
            if (resp->statusCode() == drogon::k404NotFound) {
                auto path = req->path();
                if (path.find("/api/") != 0) {
                    resp->setStatusCode(drogon::k200OK);
                }
            }
        });

    drogon::app().run();
    return 0;
}
