#include <drogon/drogon.h>
#include <fstream>

int main() {
    drogon::app().loadConfigFile("./config.json");

    // SPA fallback: non-API paths that don't match a static file get index.html with 200
    auto spaResp = drogon::HttpResponse::newFileResponse(
        "./frontend/dist/web/browser/index.html",
        "",
        drogon::CT_TEXT_HTML);
    spaResp->setStatusCode(drogon::k200OK);
    drogon::app().setCustom404Page(spaResp, true);

    drogon::app().run();
    return 0;
}
