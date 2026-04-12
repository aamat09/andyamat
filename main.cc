#include <drogon/drogon.h>

int main() {
    drogon::app().loadConfigFile("./config.json");

    // SPA fallback: non-API paths that don't match a static file get index.html
    drogon::app().setCustom404Page(
        drogon::HttpResponse::newFileResponse(
            "./frontend/dist/web/browser/index.html",
            "",
            drogon::CT_TEXT_HTML),
        true);

    drogon::app().run();
    return 0;
}
