require('dotenv').config()
const http = require('node:http')
const os = require('node:os')
const osPlatform = os.platform()
const { exec } = require("child_process");
const version = '1.0.2'
const port = process.env.PORT || 6015

function log(content) {
    let message = content;
    if (message == null) {
        message = "NULL"
    }
    if (typeof (message) == 'object') {
        message = `${JSON.stringify(message)}`
    }
    console.log(message);
}

async function runShell(filePath) {
    if (!filePath) {
        return null
    }
    return new Promise((resolve, rejects) => {
        const command = `${filePath}`
        log(`runShell:start:${command}`)
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve(error.code)
            } else {
                stdout?.on?.('data', (data) => {
                    log("data]" + data.toString());
                });

                stderr?.on?.('data', (data) => {
                    log("err]" + data.toString());
                });
                resolve(0)
            }
        })
    });
}

const server = http.createServer(function (req, res) {
    const { method, url, statusCode, statusMessage, headers: {
        "content-type": contentType,
        "content-length": contentLength,
        host,
    } = {} } = req
    log(`Headers: ${JSON.stringify(req?.headers)}`)
    let bodyRaw = ''
    let bodyData
    let urlObj = new URL(url, `http://${host}`);
    log(`Path: ${urlObj.pathname}`)
    req.on('data', (chunk) => {
        bodyRaw += chunk
    })
    // req.on('readable', function() {
    //     bodyRaw += req.read()
    // })
    req.on('error', error => {
        console.warn(`Read body error: ${error?.message}`)
    })
    req.on('end', async () => {
        if (bodyRaw != null && contentType?.includes('application/json')) {
            bodyData = JSON.parse(bodyRaw)
        }
        if (bodyData) {
            log(`${method} ${url} ${contentType} ${JSON.stringify(bodyData)}`)
        } else {
            log(`${method} ${url} ${contentType} '${bodyRaw}'`)
        }
        let status = 200
        let respContentType = 'application/json'
        let data = {
            log: {
                version,
                method, url,
                body: { data: bodyData, raw: bodyRaw },
                contentType,
                contentLength,
                time: new Date().toISOString(),
                dirname: __dirname,
                filename: __filename,
                process_version: process?.versions?.node // pkg 18.5.0
            }
        }
        if (urlObj.pathname == '/os') {
            data.os = {
                // update here
            }
        } else if (urlObj.pathname == '/process') {
            // Current not support
        } else if (urlObj.pathname == '/fs') {
            data.fs = {
                // Update here
            }
        } else if (urlObj.pathname == '/os/module') {
            data.os = []
            for (let k in os) {
                data.os.push(k)
            }
        } else if (urlObj.pathname == '/version') {
            data = { version }
        } else if (urlObj.pathname.startsWith('/public')) {
            // static file
        }
        res.writeHead(status, { 'content-type': respContentType })
        res.write(JSON.stringify(data))
        res.end()
    })

})
server.listen(port)
log(`Server run on :${port}`)