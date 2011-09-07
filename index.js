var fs = require('fs');

railway.tools.translate = translateTool;

railway.tools.translate.help = {
    shortcut: 'tr',
    usage: 'translate LOCALE LANG',
    description: 'Translate ./config/locales/en.yml to TARGET_LOCALE using google translate, LANG is language name, e.g. English, Japaneese'
};

function translateTool() {
    try {
        var en = fs.readFileSync(app.root + '/config/locales/en.yml', 'utf8').toString().replace(/\\'/g, '\'').split('\n');
    } catch(e) {
        console.log('Could not read file ./config/locales/en.yml: ' + e.message);
        process.exit();
    }
    var translate = [];
    en.forEach(function (line) {
        translate.push(line.split(':')[1] || '');
    });
    var translator = require('./lib/translate');
    var text = translate.join('\n');
    var locale = args.shift();
    var langName = args.shift();
    translator.translate(text, 'en', locale, function (res, all) {
        var translated = res.split('\n');
        index = 0;
        en[0] = locale + ':';
        translated.forEach(function (line) {
            if (line) {
                while (en.length > index) {
                    if (en[++index].split(':')[1]) {
                        break;
                    }
                }
                if (en[index].match(/name/) && en[index - 1].match(/lang/)) {
                    line = langName;
                }
                line = '"' + line.replace(/^\s+|\s+$/g, '').replace(/"/g, '') + '"';
                en[index] = en[index].split(':')[0] + ': ' + line;
            }
        });
        fs.writeFileSync(app.root + '/config/locales/' + locale + '.yml', en.join('\n').replace(/'/g, '\\\''));
        console.log('Translated to ' + langName);
        process.exit(0);
    });

    return false;
};
