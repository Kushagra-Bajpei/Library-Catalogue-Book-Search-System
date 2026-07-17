// simple_server.h — Minimal single-threaded HTTP server (Winsock/POSIX)
// No external dependencies. Handles GET, POST, PUT, DELETE, OPTIONS.
// Compatible with GCC 6+ and MSVC.
#pragma once

#ifdef _WIN32
  #ifndef _WIN32_WINNT
    #define _WIN32_WINNT 0x0A00
  #endif
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
  typedef SOCKET sock_t;
  #define SOCK_INVALID INVALID_SOCKET
  #define SOCK_ERR     SOCKET_ERROR
  #define sock_close   closesocket
#else
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <arpa/inet.h>
  #include <unistd.h>
  typedef int sock_t;
  #define SOCK_INVALID (-1)
  #define SOCK_ERR     (-1)
  #define sock_close   close
#endif

#include <string>
#include <vector>
#include <map>
#include <functional>
#include <sstream>
#include <cstring>
#include <cstdio>
#include <iostream>
#include <algorithm>

namespace http {

struct Request {
    std::string method;
    std::string path;
    std::string body;
    std::map<std::string,std::string> params;   // query string
    std::vector<std::string> matches;           // regex-like path captures (simple)
    std::map<std::string,std::string> headers;
};

struct Response {
    int status = 200;
    std::string body;
    std::string content_type = "application/json";
    std::map<std::string,std::string> headers;

    void set_content(const std::string& b, const std::string& ct = "application/json") {
        body = b; content_type = ct;
    }
    void set_header(const std::string& k, const std::string& v) {
        headers[k] = v;
    }
};

using Handler = std::function<void(const Request&, Response&)>;

// ---- tiny URL decoder ----
static std::string url_decode(const std::string& s) {
    std::string out;
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '+') { out += ' '; }
        else if (s[i] == '%' && i + 2 < s.size()) {
            char hex[3] = { s[i+1], s[i+2], 0 };
            out += static_cast<char>(std::strtol(hex, nullptr, 16));
            i += 2;
        } else { out += s[i]; }
    }
    return out;
}

static std::map<std::string,std::string> parse_query(const std::string& qs) {
    std::map<std::string,std::string> m;
    std::istringstream ss(qs);
    std::string pair;
    while (std::getline(ss, pair, '&')) {
        auto eq = pair.find('=');
        if (eq == std::string::npos) { m[url_decode(pair)] = ""; }
        else { m[url_decode(pair.substr(0,eq))] = url_decode(pair.substr(eq+1)); }
    }
    return m;
}

// Simple pattern matching: /api/books/([^/]+) 
// Returns true and fills `captures` if path matches pattern.
static bool match_path(const std::string& pattern, const std::string& path,
                        std::vector<std::string>& captures) {
    captures.clear();
    // Fast exact match
    if (pattern == path) return true;
    // Check if pattern has a capture group (simplified: one capture)
    auto p = pattern.find("([^/]+)");
    if (p == std::string::npos) {
        // Wildcard ".*"
        if (pattern == ".*") return true;
        return false;
    }
    std::string prefix = pattern.substr(0, p);
    std::string suffix = pattern.substr(p + 7); // len("([^/]+)") == 7
    if (path.size() < prefix.size()) return false;
    if (path.substr(0, prefix.size()) != prefix) return false;
    std::string rest = path.substr(prefix.size());
    // find suffix in rest
    if (suffix.empty()) {
        // capture = rest (must not contain /)
        if (rest.find('/') != std::string::npos) return false;
        captures.push_back(url_decode(rest));
        return true;
    }
    auto sp = rest.find(suffix);
    if (sp == std::string::npos) return false;
    captures.push_back(url_decode(rest.substr(0, sp)));
    return true;
}

struct Route {
    std::string method;
    std::string pattern;
    Handler handler;
};

class Server {
public:
    Server() {
#ifdef _WIN32
        WSADATA w; WSAStartup(MAKEWORD(2,2), &w);
#endif
    }
    ~Server() {
#ifdef _WIN32
        WSACleanup();
#endif
    }

    void Get(const std::string& p, Handler h)     { routes_.push_back({"GET",    p, h}); }
    void Post(const std::string& p, Handler h)    { routes_.push_back({"POST",   p, h}); }
    void Put(const std::string& p, Handler h)     { routes_.push_back({"PUT",    p, h}); }
    void Delete(const std::string& p, Handler h)  { routes_.push_back({"DELETE", p, h}); }
    void Options(const std::string& p, Handler h) { routes_.push_back({"OPTIONS",p, h}); }

    bool listen(const std::string& host, int port) {
        sock_t srv = socket(AF_INET, SOCK_STREAM, 0);
        if (srv == SOCK_INVALID) { std::cerr << "socket() failed\n"; return false; }

        int opt = 1;
#ifdef _WIN32
        setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));
#else
        setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif
        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_port   = htons(static_cast<uint16_t>(port));
        addr.sin_addr.s_addr = INADDR_ANY;

        if (bind(srv, (sockaddr*)&addr, sizeof(addr)) == SOCK_ERR) {
            std::cerr << "bind() failed on port " << port << "\n";
            sock_close(srv); return false;
        }
        if (::listen(srv, 10) == SOCK_ERR) {
            std::cerr << "listen() failed\n";
            sock_close(srv); return false;
        }
        std::cout << "Server listening on http://" << host << ":" << port << "\n";

        while (true) {
            sockaddr_in client{};
#ifdef _WIN32
            int clen = sizeof(client);
#else
            socklen_t clen = sizeof(client);
#endif
            sock_t conn = accept(srv, (sockaddr*)&client, &clen);
            if (conn == SOCK_INVALID) continue;
            handle_connection(conn);
            sock_close(conn);
        }
        sock_close(srv);
        return true;
    }

private:
    std::vector<Route> routes_;

    static std::string recv_all(sock_t s) {
        std::string buf;
        char tmp[4096];
        // Read headers first
        while (true) {
            int n = recv(s, tmp, sizeof(tmp), 0);
            if (n <= 0) break;
            buf.append(tmp, n);
            if (buf.find("\r\n\r\n") != std::string::npos) break;
        }
        // Parse Content-Length and read body
        auto hend = buf.find("\r\n\r\n");
        if (hend == std::string::npos) return buf;
        std::string headers_part = buf.substr(0, hend);
        size_t body_already = buf.size() - hend - 4;

        // Find Content-Length
        std::string lc = headers_part;
        std::transform(lc.begin(), lc.end(), lc.begin(), ::tolower);
        auto cl_pos = lc.find("content-length:");
        if (cl_pos != std::string::npos) {
            size_t val_start = cl_pos + 15;
            while (val_start < lc.size() && lc[val_start] == ' ') val_start++;
            size_t val_end = lc.find("\r\n", val_start);
            int content_length = std::stoi(lc.substr(val_start, val_end - val_start));
            int remaining = content_length - (int)body_already;
            while (remaining > 0) {
                int n = recv(s, tmp, (int)std::min((int)sizeof(tmp), remaining), 0);
                if (n <= 0) break;
                buf.append(tmp, n);
                remaining -= n;
            }
        }
        return buf;
    }

    void handle_connection(sock_t conn) {
        std::string raw = recv_all(conn);
        if (raw.empty()) return;

        // Parse request line
        auto line_end = raw.find("\r\n");
        if (line_end == std::string::npos) return;
        std::string req_line = raw.substr(0, line_end);

        std::istringstream rss(req_line);
        std::string method, full_path, version;
        rss >> method >> full_path >> version;

        // Parse path and query string
        std::string path_part, query_part;
        auto qpos = full_path.find('?');
        if (qpos != std::string::npos) {
            path_part  = full_path.substr(0, qpos);
            query_part = full_path.substr(qpos + 1);
        } else {
            path_part = full_path;
        }

        // Parse headers
        std::map<std::string,std::string> hdrs;
        size_t pos = line_end + 2;
        auto hend = raw.find("\r\n\r\n");
        while (pos < hend) {
            auto nl = raw.find("\r\n", pos);
            if (nl == std::string::npos || nl >= hend) break;
            std::string hdr = raw.substr(pos, nl - pos);
            auto col = hdr.find(':');
            if (col != std::string::npos) {
                std::string k = hdr.substr(0, col);
                std::string v = hdr.substr(col + 1);
                while (!v.empty() && v[0] == ' ') v.erase(0,1);
                std::transform(k.begin(), k.end(), k.begin(), ::tolower);
                hdrs[k] = v;
            }
            pos = nl + 2;
        }

        // Body
        std::string body_str;
        if (hend != std::string::npos) body_str = raw.substr(hend + 4);

        // Build request
        Request req;
        req.method  = method;
        req.path    = path_part;
        req.body    = body_str;
        req.params  = parse_query(query_part);
        req.headers = hdrs;

        // Match route
        Response res;
        bool matched = false;
        for (auto& route : routes_) {
            if (route.method != method && route.method != "OPTIONS") {
                if (method == "OPTIONS") {
                    // fall through to first OPTIONS handler or any route
                }
            }
            if (route.method != method) continue;
            std::vector<std::string> caps;
            if (match_path(route.pattern, path_part, caps)) {
                req.matches = caps;
                // Insert empty at [0] so matches[1] is first capture (httplib compat)
                req.matches.insert(req.matches.begin(), path_part);
                route.handler(req, res);
                matched = true;
                break;
            }
        }
        if (!matched) {
            res.status = 404;
            res.body   = "{\"error\":\"Not found\"}";
        }

        // Build HTTP response
        std::ostringstream resp;
        resp << "HTTP/1.1 " << res.status << " ";
        switch(res.status) {
            case 200: resp << "OK"; break;
            case 201: resp << "Created"; break;
            case 204: resp << "No Content"; break;
            case 400: resp << "Bad Request"; break;
            case 404: resp << "Not Found"; break;
            case 409: resp << "Conflict"; break;
            default:  resp << "Error"; break;
        }
        resp << "\r\n";
        resp << "Content-Type: " << res.content_type << "; charset=utf-8\r\n";
        resp << "Content-Length: " << res.body.size() << "\r\n";
        resp << "Connection: close\r\n";
        resp << "Access-Control-Allow-Origin: *\r\n";
        resp << "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
        resp << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n";
        for (auto& h : res.headers) resp << h.first << ": " << h.second << "\r\n";
        resp << "\r\n";
        resp << res.body;

        std::string out = resp.str();
        send(conn, out.c_str(), (int)out.size(), 0);
    }
};

} // namespace http

// Global-scope alias so main.cpp uses httplib::Server/Request/Response as before
namespace httplib {
    using Request  = http::Request;
    using Response = http::Response;
    using Server   = http::Server;
}
