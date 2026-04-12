#include "AdminFilter.h"

void AdminFilter::doFilter(const HttpRequestPtr &req,
                           FilterCallback &&fcb,
                           FilterChainCallback &&fccb)
{
    auto session = req->session();
    if (session && session->getOptional<bool>("admin").value_or(false)) {
        fccb();
        return;
    }
    Json::Value json;
    json["error"] = "Unauthorized";
    auto resp = HttpResponse::newHttpJsonResponse(json);
    resp->setStatusCode(k401Unauthorized);
    fcb(resp);
}
