var http = require('http');
var url = require('url');
var util = require('util')

const DEBUG = false;
const CALLBACK_URL_TEMPLATE = 'http://callback.wannads.com/callbacks/wannads?sid=%s&sign=%s&ip=%s';
const COOKIE_SID_KEY = 'wannads-sid';
const COOKIE_SIGN_KEY = 'wannads-sign';

function getRemoteIp(req){
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip;
}

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return list;
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    return name + "=" + value + expires + "; path=/";
}

exports.before = function (request, response, urlToGo) {
    if (DEBUG) console.log("[WANNADS] Before endpoint called. URL="+request.url);

    var urlParts = url.parse(request.url, true);
    var query = urlParts.query;

    var headers = {'Location': urlToGo};

    if (query.sid && query.sign) {
        var sidCookie = createCookie(COOKIE_SID_KEY, query.sid, 30);
        var signCookie = createCookie(COOKIE_SIGN_KEY, query.sign, 30);
        headers['Set-Cookie'] = [sidCookie, signCookie];
    }

    response.writeHead(302, headers);

    response.end();

}

exports.trackIfNeeded = function (request, response) {

    var remoteIp = getRemoteIp(request);

    var cookies = parseCookies(request);
    var sid = cookies[COOKIE_SID_KEY];
    var sign = cookies[COOKIE_SIGN_KEY];

    var event = {
        'sid' : sid,
        'sign' : sign,
        'ip' : remoteIp
    };

    if (DEBUG) console.log("[WANNADS] Track event: %j", event);

    if (event.sid && event.sign) {
        var wannadsCallbackUrl = util.format(CALLBACK_URL_TEMPLATE, event.sid, event.sign, event.ip);

        if (DEBUG) console.log("[WANNADS] Sending callback: %s", wannadsCallbackUrl);

        http.get(wannadsCallbackUrl, function(res) {
            if (DEBUG) {
                res.on("data", function(chunk) {
                    if (chunk == "OK") {
                        console.log("[WANNADS] Event succesfully tracked: %j", event);
                    } else {
                        console.log("[WANNADS] Callback KO: '%s'. Event => %j", chunk, event);
                    }
                });
            }
        }).on('error', function(e) {
            if (DEBUG) console.log("[WANNADS] Callback error: '%s'. Event => %j", e.message, event);
        });

        // Delete cookies
        var sidCookie = createCookie(COOKIE_SID_KEY, '', -1);
        var signCookie = createCookie(COOKIE_SIGN_KEY, '', -1);
        response.setHeader('Set-Cookie', [sidCookie, signCookie]);
    }
};
