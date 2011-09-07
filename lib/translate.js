var http = require('http');

function serialize (hash, join_with) {
    join_with = join_with || '&';
    var s = [];
    for (var i in hash) {
        s.push(i + '=' + hash[i]);
    }
    return s.join(join_with);
}

function translate (text, source_lang, target_lang, callback) {
    source_lang = source_lang || 'ru';
    target_lang = target_lang || 'en';

    var host   = 'translate.google.com',
        path   = '/translate_a/t',
        params = {
            client: 't',
            multires: 1,
            hl: 'en',
            sl: source_lang,
            tl: target_lang,
            sc: 1,
            otf: 2,
            text: encodeURIComponent(text)
        },
        data = serialize(params);

    var req = http.request({
        method: 'POST',
        host: host,
        port: 80,
        path: path,
        headers: {
            'Host':           host,
            'Origin':         'http://translate.google.com',
            'Referer':        'http://translate.google.com/',
            'User-Agent':     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/13.0.782.220 Safari/535.1',
            'Content-Type':   'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': data.length,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3'
        }
    }, onResponse);
    req.write(data);
    req.end();

    function onResponse(response) {
        var data = '';
        response
            .on('data', function (chunk) { data += chunk.toString(); })
            .on('end', parseResponse);

        function parseResponse () {
            var obj, translation;
            data = data.replace(/,+/g, ',').replace(/,\]/g,']');
            try {
                obj = JSON.parse(data);
            } catch(e) {
                console.log(data);
                throw new Error("Couldn't parse json");
            }
            translation = obj[0].map(function (sentence) {
                return sentence[0];
            }).join('');
            callback(translation, obj);
        }
    };
}

exports.translate = translate;
