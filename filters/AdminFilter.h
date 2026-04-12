#pragma once
#include <drogon/HttpFilter.h>

using namespace drogon;

class AdminFilter : public HttpFilter<AdminFilter> {
public:
    void doFilter(const HttpRequestPtr &req,
                  FilterCallback &&fcb,
                  FilterChainCallback &&fccb) override;
};
