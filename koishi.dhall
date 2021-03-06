let secrets = ./secrets.dhall
let pwd = env:PWD as Text

in {
    prefix      = "-",
    exitCommand = True,
    port        = 8056,
    host        = "0.0.0.0",
    selfUrl     = secrets.selfUrl,
    plugins = {
        adapter-onebot = {
            protocol = "ws",
            selfId   = secrets.onebot.id,
            endpoint = secrets.onebot.server,
        },
        adapter-telegram = {
            protocol = "polling",
            token    = secrets.telegram.token,
        },
        adapter-discord.token = secrets.discord.token,
        database-mysql = {
            database   = secrets.database.name,
            host       = secrets.database.host,
            user       = secrets.database.user,
            password   = secrets.database.password,
            socketPath = secrets.database.socket,
        },
        verifier = {
            onFriendRequest      = 1,
            onGuildMemberRequest = 2,
            onGuildRequest       = 3,
        },
        youdao = {
            appKey = secrets.youdao.key,
            secret = secrets.youdao.secret,
        },
        glot = {
            apiToken        = secrets.glot.token,
            defaultLanguage = "haskell",
        },
        eval = {
            setupFiles.inj = pwd ++ "/inj/index.js",
            scriptLoader   = "coffeescript",
            timeout        = 3000,
        },
        influxdb = {
            url    = secrets.influxdb.url,
            token  = secrets.influxdb.token,
            org    = "AnillcNetwork",
            bucket = "bot",
        },
        assets-local.root       = pwd ++ "/.koishi/assets",
        feedback                = [ secrets.feedback ],
        wolfram-alpha.appid     = secrets.wolframalpha.appid,
        puppeteer.browser.args  = [ "--no-sandbox" ],
        {-
            pics                    = {=},
            picsource-miraikoi.name = "miraikoi",
            picsource-yande.instances = [{
                name = "yande",
            },{
                name = "konachan",
            }],
            picsource-lolicon = {
                name = "lolicon",
                r18  = 0,
                isDefault = True,
            },
        -}
        help = {
            options = False, -- TODO: koishi#758
        },
        forward          = {=},
        brainfuck        = {=},
        mcping           = {=},
        qrcode           = {=},
        teach            = {=},
        admin            = {=},
        bind             = {=},
        echo             = {=},
        recall           = {=},
        sudo             = {=},
        schedule         = {=},
        chess            = {=},
        switch           = {=},
        influxdb-collect = {=},
        music            = {=},
        `./src/forward`  = {=},
        `./src/do`       = {=},
        `./src/api`      = {=},
        `./src/type`     = {=},
        `./src/eval`     = {=},
        `./src/regex`    = {=},
        `./src/dynamic`  = {=},
        `./src/graphviz` = {=},
        `./src/ppt` = {
            panelToken = secrets.panel.token,
        },
    },
}